from typing import Literal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator
from app.services.catalog import BY_ID

ActivityType = Literal[
    "breathing",
    "meditation",
    "grounding",
    "movement",
    "walk",
    "music",
    "focus",
    "social",
    "journaling",
    "break",
    "game",
]


class ProfileInput(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    goals: list[
        Literal["calm", "focus", "energy", "sleep", "boundaries", "connection"]
    ] = Field(default_factory=list, max_length=6)
    preferred_types: list[ActivityType] = Field(default_factory=list, max_length=11)
    preferred_minutes: Literal[2, 3, 5, 10, 15, 20] = 5
    weekly_goal: int = Field(3, ge=1, le=14)
    timezone: str = "Asia/Kolkata"
    work_start: int = Field(9, ge=0, le=23)
    work_end: int = Field(18, ge=1, le=24)
    reminders_enabled: bool = False
    ai_consent: bool = False
    onboarded: bool = True
    favorites: list[str] = Field(default_factory=list, max_length=30)
    language: str = Field("en", max_length=10)
    interests: list[str] = Field(default_factory=list, max_length=20)
    available_time_description: str | None = Field(None, max_length=200)
    city: str | None = Field(None, max_length=100)

    @field_validator("timezone")
    @classmethod
    def valid_timezone(cls, value):
        try:
            ZoneInfo(value)
        except (ZoneInfoNotFoundError, ValueError):
            raise ValueError("Choose a valid IANA timezone")
        return value

    @field_validator("favorites")
    @classmethod
    def valid_favorites(cls, value):
        if any(v not in BY_ID for v in value):
            raise ValueError("Unknown activity")
        return list(dict.fromkeys(value))

    @model_validator(mode="after")
    def work_hours(self):
        if self.work_end <= self.work_start:
            raise ValueError("Work end must be after work start")
        return self


class CheckinInput(BaseModel):
    text: str = Field("", max_length=5000)
    mood: int | None = Field(3, ge=1, le=5)
    energy: int | None = Field(3, ge=1, le=5)
    stress: int | None = Field(3, ge=1, le=5)
    context: Literal[
        "general",
        "meetings",
        "deadlines",
        "focus",
        "sleep",
        "connection",
        "overwhelmed",
        "motivation",
        "break",
    ] = "general"
    minutes: Literal[2, 3, 5, 10, 15, 20] | None = None
    source: Literal["command", "rescue", "journal", "chat"] = "command"


class StartInput(BaseModel):
    activity_key: str
    plan_id: int | None = None
    mood_before: int = Field(3, ge=1, le=5)


class ProgressInput(BaseModel):
    elapsed_seconds: int = Field(..., ge=0, le=7200)


class CompleteInput(ProgressInput):
    mood_after: int = Field(..., ge=1, le=5)
    helpful: bool
