# ══════════════════════════════════════════════════════════════
# FILE: backend/app/config.py
# Central settings — reads secrets from .env
# ══════════════════════════════════════════════════════════════

import os
import secrets
import logging
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
SECRET_KEY = os.getenv("SECRET_KEY", "")
if len(SECRET_KEY) < 32:
    if ENVIRONMENT == "production":
        raise RuntimeError("Production requires SECRET_KEY with at least 32 characters")
    SECRET_KEY = secrets.token_urlsafe(48)
    logging.getLogger(__name__).warning(
        "Ephemeral development key: sessions expire on restart. Set SECRET_KEY to persist sessions."
    )
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./moodmentor.db")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GOOGLE_TTS_API_KEY = os.getenv("GOOGLE_TTS_API_KEY", "")
# If 2.5-flash ever errors, switch to "gemini-2.0-flash" in your .env

# Google OAuth 2.0 Settings (Least-Privilege, Secrets strictly backend-only)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI", FRONTEND_URL + "/auth/google/callback"
)
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")
if "*" in CORS_ORIGINS:
    raise RuntimeError("CORS_ORIGINS must contain explicit origins")
EMOTION_BACKEND = os.getenv("EMOTION_BACKEND", "local")
TEAM_MIN_SAMPLE = max(5, int(os.getenv("TEAM_MIN_SAMPLE", "5")))
