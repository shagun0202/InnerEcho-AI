# ══════════════════════════════════════════════════════════════
# FILE: backend/app/main.py
# ✏️ FULL REPLACEMENT — Week 4 version (analytics router added)
# ══════════════════════════════════════════════════════════════

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  (registers tables before create_all)
from app.database import Base, engine, SessionLocal
from app.routers import auth, journal, analytics, recommendations, chat, gamification, report, team, mood   # 🆕 analytics added
from app.schemas import JournalInput, EmotionResult
from app.seed import seed_activities
from app.services.emotion_service import get_emotion_service
from app.services.gemini_service import get_gemini_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)   # create tables if they don't exist
    db = SessionLocal()                      # seed activity catalog (runs once)
    try:
        seed_activities(db)
    finally:
        db.close()
    get_emotion_service()                    # preload the emotion AI model
    get_gemini_service()                     # connect Gemini (or fallback mode)
    yield


app = FastAPI(title="MoodMentor API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: restrict to frontend URL before deployment
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(journal.router)
app.include_router(recommendations.router)
app.include_router(analytics.router)  # 🆕 Week 4
app.include_router(chat.router)
app.include_router(gamification.router)
app.include_router(report.router)
app.include_router(team.router)
app.include_router(mood.router)


@app.get("/")
def root():
    return {"message": "MoodMentor API v1.0.0 🧠💚", "docs": "/docs"}


@app.post("/analyze", response_model=EmotionResult)
def analyze_emotion(payload: JournalInput):
    """Public quick-analysis — powers the live emotion meter (Week 5)."""
    return get_emotion_service().analyze(payload.text)
