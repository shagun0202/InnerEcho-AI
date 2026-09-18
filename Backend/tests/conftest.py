import os

os.environ["SECRET_KEY"] = "test-only-signing-key-with-at-least-32-characters"
os.environ["GEMINI_API_KEY"] = ""
os.environ["EMOTION_BACKEND"] = "local"
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from app.database import Base
from app.main import app, _buckets
from app.dependencies import get_db
from app.seed import seed_activities


@pytest.fixture
def env():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    # Create RAG FTS5 virtual tables for test isolation
    try:
        from app.models_rag import ensure_fts_tables

        ensure_fts_tables(engine)
    except Exception:
        pass  # RAG tests will skip gracefully if FTS5 unavailable
    factory = sessionmaker(bind=engine)

    def override():
        with factory() as db:
            yield db

    app.dependency_overrides[get_db] = override
    _buckets.clear()
    with factory() as db:
        seed_activities(db)
    client = TestClient(app)
    yield client, factory
    client.close()
    app.dependency_overrides.clear()
    engine.dispose()


def register(client, index=1):
    r = client.post(
        "/auth/signup",
        json={
            "name": f"Member {index}",
            "email": f"member{index}@example.com",
            "password": "test-password-123",
        },
    )
    assert r.status_code == 201, r.text
    return {"Authorization": "Bearer " + r.json()["access_token"]}
