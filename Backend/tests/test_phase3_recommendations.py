from conftest import register


def test_recommendations_have_why_explanation(env):
    """Activities returned by rank_activities include a 'why' explanation."""
    c, factory = env
    h = register(c)

    # Trigger a wellness plan via chat (which calls coordinate → rank_activities)
    r = c.post("/chat", json={"text": "I had a stressful day at work"}, headers=h)
    assert r.status_code == 200
    plan = r.json().get("wellness_plan", {})
    activities = plan.get("recommended_activities", [])
    # If activities are available, each should have a 'why' key
    for a in activities:
        assert "why" in a, f"Activity {a.get('id')} missing 'why' explanation"


def test_dismiss_endpoint(env):
    """POST /wellness/dismiss stores a dismissal and returns 204."""
    c, _ = env
    h = register(c)
    r = c.post(
        "/wellness/dismiss",
        json={"recommendation_id": "breathing-3"},
        headers=h,
    )
    assert r.status_code == 204
