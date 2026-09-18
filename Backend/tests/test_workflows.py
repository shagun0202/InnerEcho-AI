from datetime import datetime, timedelta, timezone
from sqlalchemy import text
from app.models import (
    InterventionSession,
    User,
    SafetyEvent,
    WellnessProfile,
    WellnessCheckin,
)
from app.migrations import migrate
from app.services.auth_service import create_access_token
from app.services.wellness_service import effectiveness
from conftest import register


def test_auth_and_unicode_passwords(env):
    c, _ = env
    a = register(c)
    assert c.get("/auth/me", headers=a).json()["name"] == "Member 1"
    assert (
        c.post(
            "/auth/login", json={"email": "member1@example.com", "password": "wrong"}
        ).status_code
        == 401
    )
    assert (
        c.post(
            "/auth/signup",
            json={"name": "Unicode", "email": "utf@example.com", "password": "界" * 30},
        ).status_code
        == 422
    )
    assert c.get("/auth/me", headers={"Authorization": "Bearer bad"}).status_code == 401


def test_google_only_user_password_login_does_not_crash(env):
    c, dbs = env
    with dbs() as db:
        db.add(
            User(
                name="Google user",
                email="google@example.com",
                password_hash=None,
                google_id="verified-subject",
            )
        )
        db.commit()
    assert (
        c.post(
            "/auth/login", json={"email": "google@example.com", "password": "arbitrary"}
        ).status_code
        == 401
    )


def test_journal_chat_contracts_and_privacy(env):
    c, _ = env
    a = register(c)
    b = register(c, 2)
    r = c.post(
        "/journal", headers=a, json={"text": "Meetings left me exhausted today."}
    )
    assert r.status_code == 201, r.text
    entry = r.json()
    assert entry["text"] and entry["ai_reply"] and entry["wellness_plan"]["activity"]
    assert c.get(f"/journal/{entry['id']}", headers=b).status_code == 404
    assert c.delete(f"/journal/{entry['id']}", headers=b).status_code == 404
    r = c.post("/chat", headers=a, json={"text": "I feel distracted after meetings."})
    assert r.status_code == 200, r.text
    assert r.json()["reply"]["text"] and r.json()["user_message"]["text"]
    assert c.get("/chat/history", headers=b).json() == []
    # Journals and chat without explicit numeric mood never invent chart points.
    assert c.get("/wellness/summary", headers=a).json()["mood_trend"] == []
    assert c.delete("/chat/history", headers=a).status_code == 204


def test_profiles_preferences_and_validation(env):
    c, _ = env
    a = register(c)
    profile = c.get("/wellness/profile", headers=a).json()
    assert profile["onboarded"] is False and profile["ai_consent"] is False
    profile.update(
        preferred_types=["music"], goals=["calm"], onboarded=True, favorites=["music-5"]
    )
    assert c.put("/wellness/profile", headers=a, json=profile).status_code == 200
    assert c.get("/wellness/profile", headers=a).json()["favorites"] == ["music-5"]
    profile["timezone"] = "not-a-zone"
    assert c.put("/wellness/profile", headers=a, json=profile).status_code == 422


def test_complete_learn_resume_and_idempotency(env):
    c, dbs = env
    a = register(c)
    b = register(c, 2)
    plan = c.post(
        "/wellness/checkins",
        headers=a,
        json={"mood": 2, "energy": 2, "stress": 4, "context": "meetings", "minutes": 3},
    ).json()
    assert plan["activity"]["minutes"] <= 3
    payload = {
        "activity_key": plan["activity"]["id"],
        "plan_id": plan["id"],
        "mood_before": 2,
    }
    r = c.post("/wellness/sessions", headers=a, json=payload)
    assert r.status_code == 201, r.text
    session = r.json()
    key = session["id"]
    duration = session["duration_seconds"]
    assert c.post("/wellness/sessions", headers=a, json=payload).json()["id"] == key
    assert (
        c.post(
            f"/wellness/sessions/{key}/complete",
            headers=a,
            json={"elapsed_seconds": duration, "mood_after": 4, "helpful": True},
        ).status_code
        == 422
    )
    assert (
        c.patch(
            f"/wellness/sessions/{key}", headers=b, json={"elapsed_seconds": 1}
        ).status_code
        == 404
    )
    with dbs() as db:
        row = db.get(InterventionSession, key)
        row.started_at = datetime.now(timezone.utc) - timedelta(seconds=duration + 5)
        db.commit()
    assert (
        c.patch(
            f"/wellness/sessions/{key}", headers=a, json={"elapsed_seconds": 30}
        ).json()["elapsed_seconds"]
        == 30
    )
    assert (
        c.get("/wellness/summary", headers=a).json()["active_sessions"][0][
            "elapsed_seconds"
        ]
        == 30
    )
    payload = {"elapsed_seconds": duration, "mood_after": 4, "helpful": True}
    assert (
        c.post(f"/wellness/sessions/{key}/complete", headers=a, json=payload).json()[
            "mood_change"
        ]
        == 2
    )
    assert (
        c.post(
            f"/wellness/sessions/{key}/complete", headers=a, json=payload
        ).status_code
        == 200
    )
    summary = c.get("/wellness/summary", headers=a).json()
    assert (
        summary["total_sessions"] == 1
        and summary["streak"] == 1
        and summary["weekly_sessions"] == 1
    )
    assert summary["effectiveness"][0]["average_change"] == 2
    assert len(summary["mood_trend"]) == 1


def test_negative_feedback_changes_ranking(env):
    c, dbs = env
    a = register(c)
    check = {"mood": 2, "energy": 3, "stress": 4, "context": "general", "minutes": 5}
    first = c.post("/wellness/checkins", headers=a, json=check).json()
    assert first["activity"]["type"] == "breathing"
    with dbs() as db:
        user = db.query(User).first()
        for _ in range(4):
            db.add(
                InterventionSession(
                    user_id=user.id,
                    activity_key="breathing-3",
                    activity_type="breathing",
                    duration_seconds=180,
                    elapsed_seconds=180,
                    mood_before=4,
                    mood_after=1,
                    helpful=False,
                    status="completed",
                    completed_at=datetime.now(timezone.utc),
                )
            )
        db.commit()
    second = c.post("/wellness/checkins", headers=a, json=check).json()
    assert second["activity"]["type"] == "meditation"


def test_safety_precedes_ai_and_never_fakes_delivery(env, monkeypatch):
    c, dbs = env
    a = register(c)
    import app.services.wellness_service as service

    monkeypatch.setattr(
        service,
        "get_emotion_service",
        lambda: (_ for _ in ()).throw(AssertionError("AI should not run")),
    )
    plan = c.post(
        "/wellness/checkins",
        headers=a,
        json={"text": "I want to kill myself", "mood": 1},
    ).json()
    assert plan["status"] == "support" and plan["activity"] is None
    contact = {
        "name": "Test Contact",
        "relationship_type": "Friend",
        "phone": "+910000000000",
        "notification_mode": "ask",
    }
    assert c.post("/safety/contact", headers=a, json=contact).status_code == 201
    response = c.post("/safety/notify", headers=a, json={})
    assert response.status_code == 200 and response.json()["success"] is False
    with dbs() as db:
        assert db.query(SafetyEvent).first().notified_contact is False


def test_team_boundaries_threshold_and_named_kudos(env):
    c, _ = env
    headers = [register(c, i) for i in range(1, 7)]
    team = c.post(
        "/team/workspace", headers=headers[0], json={"name": "Private team"}
    ).json()
    assert c.get("/team/mood/summary", headers=headers[5]).status_code == 403
    for header in headers[1:5]:
        assert (
            c.post(
                "/team/join", headers=header, json={"code": team["invite_code"]}
            ).status_code
            == 200
        )
    for header in headers[:4]:
        assert (
            c.post(
                "/team/mood",
                headers=header,
                json={"mood": "good", "note": "private identifying note"},
            ).status_code
            == 201
        )
    hidden = c.get("/team/mood/summary", headers=headers[0]).json()
    assert (
        hidden["visible"] is False
        and hidden["total_submissions"] is None
        and hidden["mood_counts"] == {}
    )
    c.post("/team/mood", headers=headers[4], json={"mood": "rough"})
    visible = c.get("/team/mood/summary", headers=headers[0]).json()
    assert (
        visible["visible"]
        and visible["total_submissions"] == 5
        and "recent_notes" not in visible
    )
    assert (
        c.post("/team/mood", headers=headers[0], json={"mood": "good"}).status_code
        == 409
    )
    c.post(
        "/team/kudos",
        headers=headers[0],
        json={"recipient_name": "Colleague", "message": "Thanks for your help."},
    )
    c.post("/team/workspace", headers=headers[5], json={"name": "Separate team"})
    assert c.get("/team/kudos", headers=headers[5]).json() == []


def test_catalog_sessions_authorization_and_abandon(env):
    c, _ = env
    a = register(c)
    assert c.get("/wellness/catalog").status_code in [401, 403]
    assert len(c.get("/wellness/catalog", headers=a).json()) >= 14
    r = c.post(
        "/wellness/sessions", headers=a, json={"activity_key": "fake", "mood_before": 3}
    )
    assert r.status_code == 422
    session = c.post(
        "/wellness/sessions",
        headers=a,
        json={"activity_key": "grounding-2", "mood_before": 3},
    ).json()
    assert (
        c.post(
            "/wellness/sessions",
            headers=a,
            json={"activity_key": "music-5", "mood_before": 3},
        ).status_code
        == 409
    )
    assert (
        c.post(f"/wellness/sessions/{session['id']}/abandon", headers=a).status_code
        == 204
    )
    assert c.get("/wellness/summary", headers=a).json()["total_sessions"] == 0


def test_legacy_migration_adds_google_and_team_columns(env):
    from sqlalchemy import create_engine, inspect

    engine = create_engine("sqlite://")
    with engine.begin() as conn:
        conn.execute(
            text(
                "CREATE TABLE users (id INTEGER PRIMARY KEY,name VARCHAR(50),email VARCHAR(255),password_hash VARCHAR(255),created_at DATETIME)"
            )
        )
    migrate(engine)
    migrate(engine)
    assert {"google_id", "picture", "auth_provider"} <= {
        c["name"] for c in inspect(engine).get_columns("users")
    }


def test_ai_consent_blocks_external_calls(env, monkeypatch):
    c, _ = env
    a = register(c)
    import app.services.gemini_service as gemini

    class Forbidden:
        @property
        def models(self):
            raise AssertionError("No text may be sent without consent")

    monkeypatch.setattr(gemini.get_gemini_service(), "client", Forbidden())
    assert (
        c.post(
            "/journal", headers=a, json={"text": "A normal workday with some meetings"}
        ).status_code
        == 201
    )
    assert (
        c.post(
            "/chat", headers=a, json={"text": "Some thoughts about my day"}
        ).status_code
        == 200
    )


def test_plan_change_and_dismiss(env):
    c, _ = env
    a = register(c)
    p = c.post("/wellness/checkins", headers=a, json={"mood": 3}).json()
    changed = c.post(f"/wellness/plans/{p['id']}/change", headers=a).json()
    assert changed["activity"]["id"] != p["activity"]["id"]
    assert c.post(f"/wellness/plans/{p['id']}/dismiss", headers=a).status_code == 204
    assert (
        c.post(
            "/wellness/sessions",
            headers=a,
            json={
                "activity_key": changed["activity"]["id"],
                "plan_id": p["id"],
                "mood_before": 3,
            },
        ).status_code
        == 409
    )


def test_oauth_unconfigured_and_no_mock_path(env):
    c, _ = env
    assert c.get("/auth/google/config").json()["enabled"] is False
    assert c.post(
        "/auth/google", json={"credential": "mock_google_victim"}
    ).status_code in [404, 405]
    assert (
        c.post("/auth/google/url", json={"code_challenge": "a" * 43}).status_code == 503
    )


def test_alternative_preserves_checkin_time_budget(env):
    c, _ = env
    headers = register(c)
    profile = c.get("/wellness/profile", headers=headers).json()
    profile["preferred_minutes"] = 20
    assert c.put("/wellness/profile", headers=headers, json=profile).status_code == 200
    plan = c.post(
        "/wellness/checkins", headers=headers, json={"minutes": 2, "context": "focus"}
    ).json()
    for _ in range(8):
        changed = c.post(f"/wellness/plans/{plan['id']}/change", headers=headers)
        assert changed.status_code == 200
        assert changed.json()["activity"]["minutes"] <= 2


def test_database_rejects_multiple_active_sessions(env):
    import pytest
    from sqlalchemy.exc import IntegrityError

    c, dbs = env
    register(c)
    with dbs() as db:
        user_id = db.query(User).first().id
        for key in ["breathing-3", "grounding-2"]:
            db.add(
                InterventionSession(
                    user_id=user_id,
                    activity_key=key,
                    activity_type="breathing",
                    duration_seconds=180,
                    mood_before=3,
                )
            )
        with pytest.raises(IntegrityError):
            db.commit()
        db.rollback()


# ─── RAG tests ───────────────────────────────────────────────


def _ingest_test_docs(factory):
    """Helper: insert two knowledge documents with chunks into the test DB."""
    from app.models_rag import KnowledgeDocument, KnowledgeChunk
    import hashlib

    with factory() as db:
        doc = KnowledgeDocument(
            doc_id="test-breathing",
            title="Breathing Techniques for Stress",
            source_url="https://example.org/breathing",
            source_name="Example Wellness",
            language="en",
            category="breathing",
            review_date="2026-01-01",
        )
        db.add(doc)
        db.flush()
        content = "Deep diaphragmatic breathing activates the parasympathetic nervous system and helps reduce cortisol levels."
        chunk = KnowledgeChunk(
            document_id=doc.id,
            chunk_index=0,
            content=content,
            chunk_hash=hashlib.sha256(content.encode()).hexdigest(),
        )
        db.add(chunk)

        doc2 = KnowledgeDocument(
            doc_id="test-sleep",
            title="Sleep Hygiene Basics",
            source_url="https://example.org/sleep",
            source_name="Example Health",
            language="en",
            category="sleep",
        )
        db.add(doc2)
        db.flush()
        content2 = "Maintaining a consistent bedtime routine improves sleep quality and helps regulate circadian rhythm."
        chunk2 = KnowledgeChunk(
            document_id=doc2.id,
            chunk_index=0,
            content=content2,
            chunk_hash=hashlib.sha256(content2.encode()).hexdigest(),
        )
        db.add(chunk2)
        db.commit()

        # Rebuild FTS index
        db.execute(
            text(
                "INSERT INTO knowledge_fts(knowledge_fts) VALUES('rebuild')"
            )
        )
        db.commit()


def test_chat_response_has_sources_field(env):
    """Chat responses include the new sources array even when RAG returns nothing."""
    c, _ = env
    h = register(c)
    r = c.post("/chat", json={"text": "I feel happy today"}, headers=h)
    assert r.status_code == 200
    data = r.json()
    assert "sources" in data
    assert isinstance(data["sources"], list)
    assert "used_personal_context" in data


def test_rag_retrieval_returns_relevant_chunks(env):
    """FTS5 retrieval finds relevant knowledge chunks."""
    c, factory = env
    _ingest_test_docs(factory)

    from app.services.rag_service import get_rag_service

    with factory() as db:
        results = get_rag_service().retrieve(db, "breathing stress cortisol")
        assert len(results) >= 1
        assert any("breathing" in r["content"].lower() for r in results)
        assert results[0].get("chunk_id") is not None
        assert results[0].get("document_title") is not None


def test_rag_retrieval_empty_for_unrelated_query(env):
    """FTS5 returns no results for completely unrelated queries."""
    c, factory = env
    _ingest_test_docs(factory)

    from app.services.rag_service import get_rag_service

    with factory() as db:
        results = get_rag_service().retrieve(db, "quantum physics black hole")
        assert results == []


def test_privacy_isolation_personal_context(env):
    """User A's journal entries never appear in user B's personal context."""
    c, factory = env
    h_a = register(c, 1)
    h_b = register(c, 2)

    # User A writes a journal entry
    c.post("/journal", json={"text": "My secret private thought about anxiety"}, headers=h_a)

    # Enable AI consent for user B
    from app.models import User, WellnessProfile

    with factory() as db:
        user_b = db.query(User).filter(User.email == "member2@example.com").first()
        profile = db.query(WellnessProfile).filter_by(user_id=user_b.id).first()
        if profile:
            profile.ai_consent = True
        else:
            db.add(WellnessProfile(user_id=user_b.id, ai_consent=True))
        db.commit()

    # Build personal context for user B
    from app.services.personal_context_service import get_personal_context_service

    with factory() as db:
        user_b = db.query(User).filter(User.email == "member2@example.com").first()
        pcs = get_personal_context_service()
        pcs.rebuild_user_index(db, user_b.id)
        results = pcs.retrieve_relevant_context(
            db, user_b.id, "anxiety", ai_consent=True
        )
        # User B must get nothing — user A's data is isolated
        assert results is not None
        assert len(results) == 0


def test_consent_gating_personal_context(env):
    """Personal context returns None when ai_consent is False."""
    c, factory = env
    h = register(c)

    from app.services.personal_context_service import get_personal_context_service
    from app.models import User

    with factory() as db:
        user = db.query(User).first()
        pcs = get_personal_context_service()
        result = pcs.retrieve_relevant_context(
            db, user.id, "stress", ai_consent=False
        )
        assert result is None


def test_personal_context_deletion(env):
    """Deleting personal context index does not delete source data."""
    c, factory = env
    h = register(c)

    # Create some journal entries
    c.post("/journal", json={"text": "Feeling stressed about deadlines today"}, headers=h)

    from app.services.personal_context_service import get_personal_context_service
    from app.models import User, JournalEntry

    with factory() as db:
        user = db.query(User).first()
        pcs = get_personal_context_service()
        pcs.rebuild_user_index(db, user.id)
        pcs.delete_user_context(db, user.id)

        # Personal context index is empty
        results = pcs.retrieve_relevant_context(
            db, user.id, "stress", ai_consent=True
        )
        assert results is not None
        assert len(results) == 0

        # But the original journal entry still exists
        entries = db.query(JournalEntry).filter_by(user_id=user.id).count()
        assert entries >= 1


def test_crisis_bypasses_rag(env):
    """Crisis messages always get the crisis reply, never RAG."""
    c, factory = env
    _ingest_test_docs(factory)
    h = register(c)
    r = c.post(
        "/chat",
        json={"text": "I want to kill myself"},
        headers=h,
    )
    assert r.status_code == 200
    data = r.json()
    assert data["crisis"] is True
    # Crisis reply should not have RAG sources
    assert len(data["sources"]) == 0


def test_clear_personal_context_endpoint(env):
    """The DELETE /chat/personal-context endpoint works."""
    c, _ = env
    h = register(c)
    r = c.delete("/chat/personal-context", headers=h)
    assert r.status_code == 204

