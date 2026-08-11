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

