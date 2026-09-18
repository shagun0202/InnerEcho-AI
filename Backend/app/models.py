# ══════════════════════════════════════════════════════════════
# FILE: backend/app/models.py
# ✏️ FULL REPLACEMENT — adds ai_reply, Activity, Recommendation
# ══════════════════════════════════════════════════════════════

from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
    JSON,
    Boolean,
    Index,
    text,
)
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

    entries = relationship(
        "JournalEntry", back_populates="user", cascade="all, delete-orphan"
    )
    chat_messages = relationship(
        "ChatMessage", back_populates="user", cascade="all, delete-orphan"
    )
    quick_moods = relationship(
        "QuickMood", back_populates="user", cascade="all, delete-orphan"
    )
    trusted_contacts = relationship(
        "TrustedContact",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    @property
    def trusted_contact(self):
        for c in self.trusted_contacts:
            if c.role == "trusted_contact":
                return c
        return self.trusted_contacts[0] if self.trusted_contacts else None

    integrations = relationship(
        "ConnectedIntegration", back_populates="user", cascade="all, delete-orphan"
    )
    safety_events = relationship(
        "SafetyEvent", back_populates="user", cascade="all, delete-orphan"
    )


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    ai_reply = Column(Text, nullable=True)  # 🆕 Gemini's response
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), index=True
    )

    user = relationship("User", back_populates="entries")
    analysis = relationship(
        "EmotionAnalysis",
        back_populates="entry",
        uselist=False,
        cascade="all, delete-orphan",
    )
    recommendations = relationship(
        "Recommendation", back_populates="entry", cascade="all, delete-orphan"
    )


class EmotionAnalysis(Base):
    __tablename__ = "emotion_analysis"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=False)
    emotions_json = Column(JSON, nullable=False)
    dominant_emotion = Column(String(20), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    valence_score = Column(Float, nullable=False)

    entry = relationship("JournalEntry", back_populates="analysis")


class Activity(Base):  # 🆕 wellness activity catalog
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    emotion = Column(String(20), nullable=False, index=True)  # target emotion
    type = Column(String(30), nullable=False)  # breathing, journaling, music...
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)  # the actual steps / instructions


class Recommendation(Base):  # 🆕 entry ↔ activity + rating
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    rating = Column(Integer, nullable=True)  # 1 = 👍 helpful, -1 = 👎, NULL = unrated

    entry = relationship("JournalEntry", back_populates="recommendations")
    activity = relationship("Activity")


class ChatMessage(Base):  # 🆕 Week 5 — companion chat
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(10), nullable=False)  # "user" or "assistant"
    text = Column(Text, nullable=False)
    emotion = Column(String(20), nullable=True)  # detected emotion (user msgs only)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="chat_messages")


class QuickMood(Base):
    """A lightweight private mood check-in, separate from a full journal entry."""

    __tablename__ = "quick_moods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    mood = Column(String(20), nullable=False)
    note = Column(String(100), nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), index=True
    )

    user = relationship("User", back_populates="quick_moods")


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    badge_id = Column(String(30), nullable=False)  # e.g., 'first_bloom', 'streak_7'
    unlocked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")


class TeamMood(Base):
    """Anonymous team mood submission — no names, just feelings."""

    __tablename__ = "team_moods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    team_id = Column(
        Integer, ForeignKey("wellness_teams.id"), nullable=True, index=True
    )
    mood = Column(
        String(20), nullable=False
    )  # emoji label: 'great','good','okay','rough','struggling'
    note = Column(String(200), nullable=True)  # optional anonymous note
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), index=True
    )


class Kudos(Base):
    """Peer appreciation / kudos wall."""

    __tablename__ = "kudos"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    team_id = Column(
        Integer, ForeignKey("wellness_teams.id"), nullable=True, index=True
    )
    recipient_name = Column(String(100), nullable=False)  # name, not FK — can be anyone
    message = Column(String(300), nullable=False)
    emoji = Column(String(10), default="⭐")
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), index=True
    )

    sender = relationship("User")


class TrustedContact(Base):
    """Optional user-configured trusted person for wellness / emergency support."""

    __tablename__ = "trusted_contacts"
    __table_args__ = (
        Index("uq_user_role", "user_id", "role", unique=True),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    role = Column(String(20), default="trusted_contact", nullable=False)
    name = Column(String(100), nullable=False)
    relationship_type = Column(
        String(50), nullable=False
    )  # e.g., 'Friend', 'Family', 'Partner'
    phone = Column(String(30), nullable=False)
    email = Column(String(255), nullable=True)
    notification_mode = Column(String(20), default="ask")  # 'never', 'ask', 'automatic'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="trusted_contacts")


class ConnectedIntegration(Base):
    """Explicitly consented third-party integrations with least-privilege tracking."""

    __tablename__ = "connected_integrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    provider = Column(String(50), nullable=False)  # e.g. 'google'
    access_token = Column(Text, nullable=True)  # OAuth 2.0 Access Token
    refresh_token = Column(Text, nullable=True)  # OAuth 2.0 Refresh Token
    photos_enabled = Column(Boolean, default=False)
    contacts_enabled = Column(Boolean, default=False)
    scopes = Column(Text, nullable=True)  # granted scopes string
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="integrations")


class SafetyEvent(Base):
    """Audit log of detected high/critical risk events and notification actions."""

    __tablename__ = "safety_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    risk_level = Column(
        String(20), nullable=False
    )  # 'none', 'low', 'moderate', 'high', 'critical'
    trigger_source = Column(String(50), nullable=False)  # 'journal', 'chat'
    notified_contact = Column(Boolean, default=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), index=True
    )

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
    source = Column(
        String(50), default="google_photos"
    )  # 'google_photos', 'upload', 'curated'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")


class WellnessProfile(Base):
    __tablename__ = "wellness_profiles"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    goals = Column(JSON, default=list, nullable=False)
    preferred_types = Column(JSON, default=list, nullable=False)
    preferred_minutes = Column(Integer, default=5, nullable=False)
    weekly_goal = Column(Integer, default=3, nullable=False)
    timezone = Column(String(60), default="Asia/Kolkata", nullable=False)
    work_start = Column(Integer, default=9, nullable=False)
    work_end = Column(Integer, default=18, nullable=False)
    reminders_enabled = Column(Boolean, default=False, nullable=False)
    ai_consent = Column(Boolean, default=False, nullable=False)
    onboarded = Column(Boolean, default=False, nullable=False)
    favorites = Column(JSON, default=list, nullable=False)
    language = Column(String(10), default="en")
    interests = Column(JSON, default=list)
    available_time_description = Column(String(200), nullable=True)
    city = Column(String(100), nullable=True)


class WellnessCheckin(Base):
    __tablename__ = "wellness_checkins"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    mood = Column(Integer, nullable=True)
    energy = Column(Integer, nullable=True)
    stress = Column(Integer, nullable=True)
    available_minutes = Column(Integer, nullable=True)
    context = Column(String(40), nullable=False)
    emotion = Column(String(30), nullable=False)
    source = Column(String(20), nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), index=True
    )


class WellnessPlan(Base):
    __tablename__ = "wellness_plans"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    checkin_id = Column(Integer, ForeignKey("wellness_checkins.id"), nullable=False)
    activity_key = Column(String(60), nullable=True)
    recommended_activities = Column(JSON, nullable=True)
    external_recommendations = Column(JSON, nullable=True)
    rationale = Column(Text, nullable=False)
    trace = Column(JSON, nullable=False)
    safety = Column(JSON, nullable=False)
    status = Column(String(20), default="suggested", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class InterventionSession(Base):
    __tablename__ = "intervention_sessions"
    __table_args__ = (
        Index(
            "uq_active_session_per_user",
            "user_id",
            unique=True,
            sqlite_where=text("status = 'active'"),
            postgresql_where=text("status = 'active'"),
        ),
    )
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    plan_id = Column(
        Integer, ForeignKey("wellness_plans.id"), nullable=True, unique=True
    )
    activity_key = Column(String(60), nullable=False)
    activity_type = Column(String(30), nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    elapsed_seconds = Column(Integer, default=0, nullable=False)
    mood_before = Column(Integer, nullable=False)
    mood_after = Column(Integer, nullable=True)
    helpful = Column(Boolean, nullable=True)
    status = Column(String(20), default="active", nullable=False)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)


class WellnessTeam(Base):
    __tablename__ = "wellness_teams"
    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    invite_code = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class TeamMembership(Base):
    __tablename__ = "team_memberships"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    team_id = Column(
        Integer, ForeignKey("wellness_teams.id"), nullable=False, index=True
    )


class OAuthAttempt(Base):
    __tablename__ = "oauth_attempts"
    state_hash = Column(String(64), primary_key=True)
    expires_at = Column(DateTime, nullable=False)

class DismissedRecommendation(Base):
    __tablename__ = "dismissed_recommendations"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_key = Column(String(50), nullable=False)
    dismissed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
