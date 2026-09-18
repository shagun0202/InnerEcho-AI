import base64, hashlib
from urllib.parse import urlparse, parse_qs
from app.routers import google_auth as google
from app.config import SECRET_KEY, ALGORITHM
from jose import jwt
from conftest import register


def setup(monkeypatch):
    monkeypatch.setattr(google, "GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(google, "GOOGLE_CLIENT_SECRET", "test-client-secret")


def begin(c, headers=None):
    verifier = "x" * 43
    challenge = (
        base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest())
        .rstrip(b"=")
        .decode()
    )
    response = c.post(
        "/auth/google/url", headers=headers, json={"code_challenge": challenge}
    )
    state = parse_qs(urlparse(response.json()["url"]).query)["state"][0]
    return {"code": "test-code", "state": state, "code_verifier": verifier}


def test_state_pkce_nonce_and_replay(env, monkeypatch):
    c, _ = env
    setup(monkeypatch)
    payload = begin(c)
    assert (
        c.post(
            "/auth/google/callback", json={**payload, "code_verifier": "z" * 43}
        ).status_code
        == 400
    )
    state = jwt.decode(payload["state"], SECRET_KEY, algorithms=[ALGORITHM])

    class Response:
        def raise_for_status(self):
            pass

        def json(self):
            return {"id_token": "signed-google-id-token"}

    monkeypatch.setattr(google.httpx, "post", lambda *a, **k: Response())

    def claims(token, request, audience):
        assert audience == "test-client-id"
        return {
            "sub": "real-sub",
            "email": "oauth@example.com",
            "email_verified": True,
            "nonce": state["nonce"],
            "name": "Google User",
        }

    monkeypatch.setattr(google.id_token, "verify_oauth2_token", claims)
    response = c.post("/auth/google/callback", json=payload)
    assert response.status_code == 200, response.text
    assert c.post("/auth/google/callback", json=payload).status_code == 400


def test_account_linking_requires_existing_auth(env, monkeypatch):
    c, _ = env
    setup(monkeypatch)
    header = register(c)

    class Response:
        def raise_for_status(self):
            pass

        def json(self):
            return {"id_token": "token"}

    monkeypatch.setattr(google.httpx, "post", lambda *a, **k: Response())

    def run(headers):
        payload = begin(c, headers)
        state = jwt.decode(payload["state"], SECRET_KEY, algorithms=[ALGORITHM])
        monkeypatch.setattr(
            google.id_token,
            "verify_oauth2_token",
            lambda *a, **k: {
                "sub": "sub",
                "email": "member1@example.com",
                "email_verified": True,
                "nonce": state["nonce"],
            },
        )
        return c.post("/auth/google/callback", json=payload)

    assert run(None).status_code == 409
    assert run(header).status_code == 200


def test_wrong_nonce_is_rejected(env, monkeypatch):
    c, _ = env
    setup(monkeypatch)
    payload = begin(c)

    class Response:
        def raise_for_status(self):
            pass

        def json(self):
            return {"id_token": "token"}

    monkeypatch.setattr(google.httpx, "post", lambda *a, **k: Response())
    monkeypatch.setattr(
        google.id_token,
        "verify_oauth2_token",
        lambda *a, **k: {
            "sub": "sub",
            "email": "a@example.com",
            "email_verified": True,
            "nonce": "wrong",
        },
    )
    assert c.post("/auth/google/callback", json=payload).status_code == 401
