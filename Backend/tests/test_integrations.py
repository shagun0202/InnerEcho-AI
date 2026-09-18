from conftest import register


def test_integrations_places_endpoint(env):
    """GET /integrations/places returns structured nearby places with maps search URLs."""
    c, _ = env
    h = register(c)

    r = c.get("/integrations/places?emotion=sadness", headers=h)
    assert r.status_code == 200
    places = r.json()
    assert isinstance(places, list)
    assert len(places) >= 1
    for p in places:
        assert "title" in p
        assert "url" in p
        assert "icon" in p
        assert p["type"] == "outdoor"


def test_integrations_music_endpoint(env):
    """GET /integrations/music returns real Spotify/YouTube search and playlist URLs."""
    c, _ = env
    h = register(c)

    r = c.get("/integrations/music?emotion=joy", headers=h)
    assert r.status_code == 200
    music = r.json()
    assert isinstance(music, list)
    assert len(music) >= 1
    for m in music:
        assert "title" in m
        assert "spotify_url" in m
        assert "youtube_url" in m
        assert m["type"] == "music"
        assert "spotify.com" in m["spotify_url"]
        assert "youtube.com" in m["youtube_url"]


def test_integrations_require_auth(env):
    """Integration endpoints require valid JWT authentication."""
    c, _ = env
    assert c.get("/integrations/places").status_code == 401
    assert c.get("/integrations/music").status_code == 401
