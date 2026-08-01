# ══════════════════════════════════════════════════════════════
# FILE: backend/app/config.py
# Central settings — reads secrets from .env
# ══════════════════════════════════════════════════════════════

import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "insecure-dev-key-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./moodmentor.db")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
# If 2.5-flash ever errors, switch to "gemini-2.0-flash" in your .env
