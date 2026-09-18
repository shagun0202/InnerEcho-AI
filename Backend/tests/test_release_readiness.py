from conftest import register


def test_export_user_data(env):
    """GET /auth/export returns all personal data for GDPR/privacy compliance."""
    c, _ = env
    h = register(c)

    # Post a journal entry and chat message
    c.post("/journal", json={"text": "Today was a thoughtful day."}, headers=h)
    c.post("/chat", json={"text": "Hello MoodMentor, I need a pause."}, headers=h)

    # Add a trusted contact
    c.post(
        "/safety/contact",
        json={"name": "Helper", "phone": "+1-555-0000", "role": "trusted_contact"},
        headers=h,
    )

    r = c.get("/auth/export", headers=h)
    assert r.status_code == 200
    data = r.json()
    assert "user" in data
    assert "profile" in data
    assert "journal_entries" in data
    assert len(data["journal_entries"]) >= 1
    assert "chat_messages" in data
    assert len(data["chat_messages"]) >= 1
    assert "trusted_contacts" in data
    assert len(data["trusted_contacts"]) >= 1


def test_delete_user_account_cascades(env):
    """DELETE /auth/me deletes the user and prevents subsequent logins."""
    c, _ = env
    h = register(c, index=99)

    # Verify user can access profile
    assert c.get("/auth/me", headers=h).status_code == 200

    # Delete account
    del_res = c.delete("/auth/me", headers=h)
    assert del_res.status_code == 204

    # Now token should no longer work
    assert c.get("/auth/me", headers=h).status_code == 401


def test_security_headers_present(env):
    """Responses include expected security headers."""
    c, _ = env
    r = c.get("/health")
    assert r.status_code == 200
    assert r.headers.get("X-Content-Type-Options") == "nosniff"
    assert r.headers.get("Referrer-Policy") == "no-referrer"
    assert r.headers.get("Cache-Control") == "no-store"
