# ══════════════════════════════════════════════════════════════
# FILE: backend/app/schemas.py
# ✏️ FULL REPLACEMENT
# ══════════════════════════════════════════════════════════════

from datetime import datetime

from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ── Auth ─────────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Journal / Emotions ───────────────────────────────────────
class JournalInput(BaseModel):
    text: str = Field(..., min_length=3, max_length=5000)


class EmotionResult(BaseModel):
    emotions: dict[str, float]
    dominant_emotion: str
    confidence: float
    valence_score: float


# ── Recommendations ──────────────────────────────────────────
class ActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    emotion: str
    type: str
    title: str
    description: str
    duration_minutes: int
    content: str


class RecommendationResponse(BaseModel):
    id: int                      # recommendation id — used for rating
    activity: ActivityResponse


class RatingInput(BaseModel):
    rating: int = Field(..., ge=-1, le=1,
                        description="1 = helpful 👍, -1 = not helpful 👎, 0 = reset")


class JournalResponse(EmotionResult):
    id: int
    text: str
    created_at: datetime
    ai_reply: str | None
    recommendations: list[RecommendationResponse] = []


# ── Analytics ────────────────────────────────────────────────
class DailyStat(BaseModel):
    date: str
    avg_valence: float
    dominant_emotion: str
    entries: int


class DistributionResponse(BaseModel):
    total_entries: int
    dominant_counts: dict[str, int]
    average_emotions: dict[str, float]


class SummaryResponse(BaseModel):
    total_entries: int
    streak_days: int
    most_frequent_emotion: str | None
    avg_valence_all_time: float
    recent_avg_valence: float
    previous_avg_valence: float
    trend: str  # "improving" | "steady" | "declining"

# ── Chat ─────────────────────────────────────────────────────
class ChatInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    text: str
    emotion: str | None
    created_at: datetime
    

class ChatSendResponse(BaseModel):
    user_message: ChatMessageResponse   # frontend reads .user_message.emotion
    reply: ChatMessageResponse          # frontend reads .reply.text
    crisis: bool                        # frontend styles red alert when true

# ── Quick mood check-in ─────────────────────────────────────
class QuickMoodInput(BaseModel):
    mood: str = Field(..., pattern="^(joy|sadness|fear|anger|neutral|surprise|disgust)$")
    note: str | None = Field(None, max_length=100)


class QuickMoodResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    mood: str
    note: str | None
    created_at: datetime

# -- Gamification --
class AchievementDefinition(BaseModel):
    id: str
    name: str
    icon: str
    description: str
    unlocked: bool = False
    unlocked_at: datetime | None = None

class GamificationResponse(BaseModel):
    streak_days: int
    total_entries: int
    wellness_score: int
    badges: list[AchievementDefinition]

# -- Weekly Report --
class WeeklyReportResponse(BaseModel):
    week_start: str
    week_end: str
    total_entries: int
    avg_valence: float
    dominant_emotion: str
    emotion_distribution: dict[str, int]
    narrative: str          # Gemini-generated summary
    highlights: list[str]   # Key insights
    suggestion: str         # One actionable tip

# -- Team Mood Board --
class TeamMoodInput(BaseModel):
    mood: str = Field(..., pattern='^(great|good|okay|rough|struggling)$')
    note: str | None = Field(None, max_length=200)

class TeamMoodResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    mood: str
    note: str | None
    created_at: datetime

class TeamMoodSummary(BaseModel):
    total_submissions: int
    mood_counts: dict[str, int]      # {'great': 5, 'good': 12, ...}
    average_sentiment: str           # 'positive', 'neutral', 'needs_attention'
    recent_notes: list[str]          # last 10 anonymous notes
    submitted_today: bool            # whether current user already submitted

# -- Kudos --
class KudosInput(BaseModel):
    recipient_name: str = Field(..., min_length=2, max_length=100)
    message: str = Field(..., min_length=3, max_length=300)
    emoji: str = Field(default='⭐', max_length=10)

class KudosResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    sender_name: str   # resolved from sender relationship
    recipient_name: str
    message: str
    emoji: str
    created_at: datetime

# -- Meeting Recovery --
class MeetingRecoveryResponse(BaseModel):
    suggested_break_minutes: int
    activities: list[str]
    affirmation: str

# -- Work-Life Balance --
class WorkLifeScoreResponse(BaseModel):
    score: int                    # 0-100
    category: str                 # 'thriving', 'balanced', 'needs_attention', 'at_risk'
    journal_regularity: int       # % days with entries in last 30
    avg_valence: float
    evening_entries_pct: int      # % entries after 6pm (overworking signal)
    streak_days: int
    tip: str
