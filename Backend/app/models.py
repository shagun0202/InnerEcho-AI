# ══════════════════════════════════════════════════════════════
# FILE: backend/app/models.py
# ✏️ FULL REPLACEMENT — adds ai_reply, Activity, Recommendation
# ══════════════════════════════════════════════════════════════

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # nullable for OAuth users
    google_id = Column(String(255), unique=True, index=True, nullable=True)
    picture = Column(String(500), nullable=True)
    auth_provider = Column(String(50), default="local")  # "local" or "google"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    entries = relationship("JournalEntry", back_populates="user",
                           cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user",
                                 cascade="all, delete-orphan")
    quick_moods = relationship("QuickMood", back_populates="user",
                               cascade="all, delete-orphan")
    trusted_contact = relationship("TrustedContact", back_populates="user",
                                   uselist=False, cascade="all, delete-orphan")
    integrations = relationship("ConnectedIntegration", back_populates="user",
                                cascade="all, delete-orphan")
    safety_events = relationship("SafetyEvent", back_populates="user",
                                 cascade="all, delete-orphan")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    ai_reply = Column(Text, nullable=True)                # 🆕 Gemini's response
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

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
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="chat_messages")


class QuickMood(Base):
    """A lightweight private mood check-in, separate from a full journal entry."""
    __tablename__ = "quick_moods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    mood = Column(String(20), nullable=False)
    note = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="quick_moods")


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    badge_id = Column(String(30), nullable=False)    # e.g., 'first_bloom', 'streak_7'
    unlocked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")

class TeamMood(Base):
    """Anonymous team mood submission — no names, just feelings."""
    __tablename__ = "team_moods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mood = Column(String(20), nullable=False)        # emoji label: 'great','good','okay','rough','struggling'
    note = Column(String(200), nullable=True)         # optional anonymous note
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)


class Kudos(Base):
    """Peer appreciation / kudos wall."""
    __tablename__ = "kudos"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_name = Column(String(100), nullable=False)   # name, not FK — can be anyone
    message = Column(String(300), nullable=False)
    emoji = Column(String(10), default='⭐')
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    sender = relationship("User")


class TrustedContact(Base):
    """Optional user-configured trusted person for wellness / emergency support."""
    __tablename__ = "trusted_contacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    name = Column(String(100), nullable=False)
    relationship_type = Column(String(50), nullable=False)  # e.g., 'Friend', 'Family', 'Partner'
    phone = Column(String(30), nullable=False)
    email = Column(String(255), nullable=True)
    notification_mode = Column(String(20), default="ask")  # 'never', 'ask', 'automatic'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="trusted_contact")


class ConnectedIntegration(Base):
    """Explicitly consented third-party integrations with least-privilege tracking."""
    __tablename__ = "connected_integrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    provider = Column(String(50), nullable=False)           # e.g. 'google'
    access_token = Column(Text, nullable=True)              # OAuth 2.0 Access Token
    refresh_token = Column(Text, nullable=True)             # OAuth 2.0 Refresh Token
    photos_enabled = Column(Boolean, default=False)
    contacts_enabled = Column(Boolean, default=False)
    scopes = Column(Text, nullable=True)                    # granted scopes string
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="integrations")


class SafetyEvent(Base):
    """Audit log of detected high/critical risk events and notification actions."""
    __tablename__ = "safety_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    risk_level = Column(String(20), nullable=False)        # 'none', 'low', 'moderate', 'high', 'critical'
    trigger_source = Column(String(50), nullable=False)    # 'journal', 'chat'
    notified_contact = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="safety_events")


class UserMemoryPhoto(Base):
    """User-selected positive memory photo from Google Photos or personal upload."""
    __tablename__ = "user_memory_photos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    image_url = Column(Text, nullable=False)
    reflection = Column(Text, nullable=True)
    category = Column(String(50), default="personal")
    source = Column(String(50), default="google_photos")  # 'google_photos', 'upload', 'curated'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
