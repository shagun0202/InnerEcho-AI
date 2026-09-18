from conftest import register


def test_voice_status_endpoint(env):
    c, _ = env
    response = c.get("/voice/status")
    assert response.status_code == 200
    data = response.json()
    assert "available" in data
    assert "provider" in data


def test_tts_requires_auth(env):
    c, _ = env
    response = c.post("/voice/tts", json={"text": "Hello", "language": "en"})
    assert response.status_code in (401, 403)
