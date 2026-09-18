"""MoodMentor API: private wellness orchestration."""

import logging
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from threading import Lock
from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app import models
from app.database import engine, SessionLocal
from app.migrations import migrate
from app.config import CORS_ORIGINS, EMOTION_BACKEND, GEMINI_API_KEY
from app.routers import (
    auth,
    safety,
    journal,
    analytics,
    recommendations,
    chat,
    gamification,
    report,
    team,
    mood,
    wellness,
    google_auth,
    integrations,
    voice,
)
from app.seed import seed_activities
from app.services.emotion_service import get_emotion_service
from app.dependencies import get_current_user
from app.schemas import JournalInput, EmotionResult

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    migrate(engine)
    with SessionLocal() as db:
        seed_activities(db)
    # Initialize RAG knowledge base (idempotent — skips already-indexed chunks)
    try:
        from app.models_rag import ensure_fts_tables
        from app.services.rag_service import get_rag_service
        from pathlib import Path

        ensure_fts_tables(engine)
        kb_dir = Path(__file__).resolve().parents[1] / "knowledge_base"
        if kb_dir.exists():
            with SessionLocal() as db:
                stats = get_rag_service().ingest_knowledge_base(db, str(kb_dir))
                logging.getLogger(__name__).info(
                    "rag_init docs=%s chunks=%s skipped=%s",
                    stats["documents_processed"],
                    stats["chunks_created"],
                    stats["skipped"],
                )
    except Exception as e:
        logging.getLogger(__name__).warning("rag_init_skipped: %s", type(e).__name__)
    yield


app = FastAPI(
    title="MoodMentor — Employee Wellness", version="2.0.0", lifespan=lifespan
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Single-process abuse guard. Use a shared gateway limiter with multiple workers.
_buckets = defaultdict(deque)
_lock = Lock()


@app.middleware("http")
async def guard(request: Request, call_next):
    if request.method != "OPTIONS":
        group = "auth" if request.url.path.startswith("/auth") else "api"
        key = (request.client.host if request.client else "unknown", group)
        now = time.monotonic()
        limit = 30 if group == "auth" else 240
        with _lock:
            if len(_buckets) > 10000:
                _buckets.clear()
            bucket = _buckets[key]
            while bucket and now - bucket[0] > 60:
                bucket.popleft()
            if len(bucket) >= limit:
                return JSONResponse(
                    {"detail": "Too many requests. Please try again in a minute."},
                    429,
                    headers={"Retry-After": "60"},
                )
            bucket.append(now)
        try:
            content_length = int(request.headers.get("content-length", "0") or "0")
        except ValueError:
            return JSONResponse({"detail": "Invalid request size"}, 400)
        if content_length > 131072:
            return JSONResponse({"detail": "Request is too large"}, 413)
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Cache-Control"] = "no-store"
    return response


@app.exception_handler(Exception)
async def unexpected(request, exc):
    logging.getLogger(__name__).error(
        "request_failed path=%s type=%s", request.url.path, type(exc).__name__
    )
    return JSONResponse({"detail": "Something went wrong. Please try again."}, 500)


for module in [
    auth,
    safety,
    journal,
    analytics,
    recommendations,
    chat,
    gamification,
    report,
    team,
    mood,
    wellness,
    google_auth,
    integrations,
    voice,
]:
    app.include_router(module.router)


@app.get("/")
def root():
    return {"name": "MoodMentor", "version": "2.0.0", "docs": "/docs"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "emotion_backend": EMOTION_BACKEND,
        "ai_configured": bool(GEMINI_API_KEY),
        "notifications": "unconfigured",
    }


@app.post("/analyze", response_model=EmotionResult)
def analyze(payload: JournalInput, user=Depends(get_current_user)):
    return get_emotion_service().analyze(payload.text)
