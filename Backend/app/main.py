# ══════════════════════════════════════════════════════════════
# FILE: backend/app/main.py
# ✏️ FULL REPLACEMENT — Week 4 version (analytics router added)
# ══════════════════════════════════════════════════════════════

import urllib.request
import urllib.parse
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  (registers tables before create_all)
from app.database import Base, engine, SessionLocal
from app.routers import auth, safety, journal, analytics, recommendations, chat, gamification, report, team, mood

from app.schemas import JournalInput, EmotionResult
from app.seed import seed_activities
from app.services.emotion_service import get_emotion_service
from app.services.gemini_service import get_gemini_service


from sqlalchemy import text


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)   # create tables if they don't exist

    # Auto self-healing schema migration for SQLite
    with engine.connect() as conn:
        try:
            # Auto self-healing for users table
            res = conn.execute(text("PRAGMA table_info(users)"))
            cols = [row[1] for row in res.fetchall()]
            for col_name, col_type in [
                ("picture", "VARCHAR(500)"),
                ("auth_provider", "VARCHAR(50) DEFAULT 'local'"),
            ]:
                if col_name not in cols:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))

            conn.commit()
        except Exception as e:
            print("Auto-migration check notice:", e)

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
app.include_router(safety.router)
app.include_router(journal.router)
app.include_router(recommendations.router)
app.include_router(analytics.router)
app.include_router(chat.router)
app.include_router(gamification.router)
app.include_router(report.router)
app.include_router(team.router)
app.include_router(mood.router)


@app.get("/")
def root():
    return {"message": "MoodMentor API v1.0.0 🧠💚", "docs": "/docs"}


@app.get("/tts")
def text_to_speech(text: str = Query(..., description="Text to speak"), lang: str = Query("en", description="Language code: en, hi, mr, ta, ml")):
    """Streams natural pronunciation audio for Hindi, Marathi, Tamil, Malayalam, and English."""
    try:
        clean_text = text.strip()
        if not clean_text:
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Valid language codes
        valid_langs = {"en", "hi", "mr", "ta", "ml"}
        target_lang = lang.lower() if lang.lower() in valid_langs else "en"
        
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl={target_lang}&client=tw-ob&q=" + urllib.parse.quote(clean_text)
        req = urllib.request.Request(
            url, 
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"}
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            audio_data = response.read()
            
        return Response(
            content=audio_data, 
            media_type="audio/mpeg", 
            headers={
                "Cache-Control": "public, max-age=86400",
                "Accept-Ranges": "bytes"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation error: {str(e)}")


@app.post("/analyze", response_model=EmotionResult)
def analyze_emotion(payload: JournalInput):
    """Public quick-analysis — powers the live emotion meter (Week 5)."""
    return get_emotion_service().analyze(payload.text)
