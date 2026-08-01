# ══════════════════════════════════════════════════════════════
# FILE: backend/app/database.py
# SQLAlchemy engine + session factory
# ══════════════════════════════════════════════════════════════

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import DATABASE_URL

# check_same_thread is a SQLite-only setting; remove it for PostgreSQL
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()