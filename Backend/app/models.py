# ══════════════════════════════════════════════════════════════
# FILE: backend/app/models.py
# ✏️ FULL REPLACEMENT — adds ai_reply, Activity, Recommendation
# ══════════════════════════════════════════════════════════════

from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    entries = relationship("JournalEntry", back_populates="user",
                           cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user",   # 🆕 ADD THIS
                                 cascade="all, delete-orphan")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    ai_reply = Column(Text, nullable=True)                # 🆕 Gemini's response
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="entries")
    analysis = relationship("EmotionAnalysis", back_populates="entry",
                            uselist=False, cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="entry",
                                   cascade="all, delete-orphan")


class EmotionAnalysis(Base):
    __tablename__ = "emotion_analysis"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=False)
    emotions_json = Column(JSON, nullable=False)
    dominant_emotion = Column(String(20), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    valence_score = Column(Float, nullable=False)

    entry = relationship("JournalEntry", back_populates="analysis")


class Activity(Base):                                     # 🆕 wellness activity catalog
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    emotion = Column(String(20), nullable=False, index=True)  # target emotion
    type = Column(String(30), nullable=False)   # breathing, journaling, music...
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)      # the actual steps / instructions


class Recommendation(Base):                               # 🆕 entry ↔ activity + rating
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    rating = Column(Integer, nullable=True)     # 1 = 👍 helpful, -1 = 👎, NULL = unrated

    entry = relationship("JournalEntry", back_populates="recommendations")
    activity = relationship("Activity")

class ChatMessage(Base):                                # 🆕 Week 5 — companion chat
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(10), nullable=False)       # "user" or "assistant"
    text = Column(Text, nullable=False)
    emotion = Column(String(20), nullable=True)     # detected emotion (user msgs only)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")
