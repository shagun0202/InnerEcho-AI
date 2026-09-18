"""Explicit membership boundaries and minimum-size team aggregates."""

import secrets
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.config import TEAM_MIN_SAMPLE
from app.models import (
    User,
    TeamMood,
    Kudos,
    JournalEntry,
    EmotionAnalysis,
    WellnessTeam,
    TeamMembership,
    InterventionSession,
)
from app.schemas import (
    TeamMoodInput,
    KudosInput,
    KudosResponse,
    MeetingRecoveryResponse,
    WorkLifeScoreResponse,
)

router = APIRouter(prefix="/team", tags=["Private team wellness"])


class CreateTeam(BaseModel):
    name: str = Field(min_length=2, max_length=80)


class JoinTeam(BaseModel):
    code: str = Field(min_length=12, max_length=50)


def membership(db, user_id):
    member = db.get(TeamMembership, user_id)
    if not member:
        raise HTTPException(403, "Join or create a team first")
    return member


@router.get("/workspace")
def workspace(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    member = db.get(TeamMembership, user.id)
    if not member:
        return None
    team = db.get(WellnessTeam, member.team_id)
    return dict(
        id=team.id,
        name=team.name,
        invite_code=team.invite_code if team.owner_id == user.id else None,
        members=db.query(TeamMembership).filter_by(team_id=team.id).count(),
        is_owner=team.owner_id == user.id,
    )


@router.post("/workspace", status_code=201)
def create(
    payload: CreateTeam,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if db.get(TeamMembership, user.id):
        raise HTTPException(409, "You already belong to a team")
    team = WellnessTeam(
        name=payload.name.strip(),
        owner_id=user.id,
        invite_code=secrets.token_urlsafe(18),
    )
    db.add(team)
    db.flush()
    db.add(TeamMembership(user_id=user.id, team_id=team.id))
    db.commit()
    return workspace(db, user)


@router.post("/join")
def join(
    payload: JoinTeam,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if db.get(TeamMembership, user.id):
        raise HTTPException(409, "You already belong to a team")
    team = db.query(WellnessTeam).filter_by(invite_code=payload.code.strip()).first()
    if not team:
        raise HTTPException(404, "Invite code is invalid")
    db.add(TeamMembership(user_id=user.id, team_id=team.id))
    db.commit()
    return workspace(db, user)


@router.post("/leave", status_code=204)
def leave(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    member = membership(db, user.id)
    team = db.get(WellnessTeam, member.team_id)
    if team.owner_id == user.id:
        raise HTTPException(
            409,
            "Team owners cannot leave. Create a separate account to use another workspace.",
        )
    db.delete(member)
    db.commit()


@router.post("/mood", status_code=201)
def submit_team_mood(
    payload: TeamMoodInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = membership(db, current_user.id)
    today = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    if (
        db.query(TeamMood)
        .filter(
            TeamMood.user_id == current_user.id,
            TeamMood.team_id == member.team_id,
            TeamMood.created_at >= today,
        )
        .first()
    ):
        raise HTTPException(409, "You already shared a mood today")
    # Do not expose free-text notes; they can identify a person even without a name.
    row = TeamMood(
        user_id=current_user.id, team_id=member.team_id, mood=payload.mood, note=None
    )
    db.add(row)
    db.commit()
    return {"saved": True}


@router.get("/mood/summary")
def team_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    member = membership(db, user.id)
    now = datetime.now(timezone.utc)
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    rows = (
        db.query(TeamMood)
        .filter(
            TeamMood.team_id == member.team_id,
            TeamMood.created_at >= now - timedelta(days=7),
        )
        .all()
    )
    people = {r.user_id for r in rows}
    visible = len(people) >= TEAM_MIN_SAMPLE
    submitted = any(
        r.user_id == user.id and r.created_at.replace(tzinfo=timezone.utc) >= today
        for r in rows
    )
    counts = {
        k: sum(r.mood == k for r in rows)
        for k in ["great", "good", "okay", "rough", "struggling"]
    }
    return dict(
        visible=visible,
        minimum_sample=TEAM_MIN_SAMPLE,
        total_submissions=len(rows) if visible else None,
        mood_counts=counts if visible else {},
        submitted_today=submitted,
        privacy_message="Aggregates appear only after at least five distinct members participate. No individual moods or journals are shared.",
    )


@router.post("/kudos", response_model=KudosResponse, status_code=201)
def send_kudos(
    payload: KudosInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = membership(db, current_user.id)
    entry = Kudos(
        sender_id=current_user.id, team_id=member.team_id, **payload.model_dump()
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return KudosResponse(
        id=entry.id,
        sender_name=current_user.name,
        recipient_name=entry.recipient_name,
        message=entry.message,
        emoji=entry.emoji,
        created_at=entry.created_at,
    )


@router.get("/kudos", response_model=list[KudosResponse])
def kudos(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    member = membership(db, user.id)
    rows = (
        db.query(Kudos)
        .filter_by(team_id=member.team_id)
        .order_by(Kudos.id.desc())
        .limit(limit)
        .all()
    )
    return [
        KudosResponse(
            id=r.id,
            sender_name=r.sender.name,
            recipient_name=r.recipient_name,
            message=r.message,
            emoji=r.emoji,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.get("/challenge")
def challenge(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    member = membership(db, user.id)
    # Only explicitly shared team check-ins count; private sessions never feed team metrics.
    rows = (
        db.query(TeamMood)
        .filter(
            TeamMood.team_id == member.team_id,
            TeamMood.created_at >= datetime.now(timezone.utc) - timedelta(days=7),
        )
        .all()
    )
    visible = len({r.user_id for r in rows}) >= TEAM_MIN_SAMPLE
    return dict(
        title="Make room for a pause",
        description="An optional team campaign: take a small break, then share a team check-in.",
        goal=20,
        progress=len(rows) if visible else None,
        visible=visible,
    )


RECOVERY_ACTIVITIES = [
    "🧘 Take 5 deep breaths with the 4-4-6 pattern",
    "🚶 Take a 3-minute walk, even just around the room",
    "💧 Drink a full glass of water mindfully",
    "👀 Look at something 20 feet away for 20 seconds (20-20-20 rule)",
    "✍️ Write one thing that went well in that meeting",
    "🎵 Listen to one song that makes you feel good",
    "🌿 Step outside for 60 seconds of fresh air",
    "🤸 Do 5 gentle stretches at your desk",
]

AFFIRMATIONS = [
    "You handled that well. Now take a moment for yourself.",
    "Meetings end, but your peace of mind doesn't have to.",
    "You showed up and contributed. That matters.",
    "Time to reset. The next task can wait 2 minutes.",
    "You deserve a micro-break. Your brain will thank you.",
]

import random


@router.get("/meeting-recovery", response_model=MeetingRecoveryResponse)
def get_meeting_recovery(current_user: User = Depends(get_current_user)):
    """Get a personalized post-meeting recovery plan."""
    activities = random.sample(RECOVERY_ACTIVITIES, min(3, len(RECOVERY_ACTIVITIES)))
    affirmation = random.choice(AFFIRMATIONS)
    return MeetingRecoveryResponse(
        suggested_break_minutes=random.choice([2, 3, 5]),
        activities=activities,
        affirmation=affirmation,
    )


# ── Work-Life Balance Score ──────────────────────────────────


@router.get("/work-life-score", response_model=WorkLifeScoreResponse)
def get_work_life_score(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Compute a work-life balance score based on journaling patterns."""
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)

    entries = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.user_id == current_user.id,
            JournalEntry.created_at >= thirty_days_ago,
        )
        .all()
    )

    total_days = 30
    entry_dates = set(e.created_at.date() for e in entries)
    regularity = int((len(entry_dates) / total_days) * 100)

    # Average valence
    analyses = []
    for e in entries:
        a = db.query(EmotionAnalysis).filter(EmotionAnalysis.entry_id == e.id).first()
        if a:
            analyses.append(a)
    avg_valence = (
        sum(a.valence_score for a in analyses) / len(analyses) if analyses else 0.0
    )

    # Evening entries (after 6 PM local — approximated as UTC 13:00+)
    evening = sum(1 for e in entries if e.created_at.hour >= 18)
    evening_pct = int((evening / len(entries)) * 100) if entries else 0

    # Streak
    dates = sorted(entry_dates, reverse=True)
    streak = 0
    if dates:
        today = now.date()
        if dates[0] >= today - timedelta(days=1):
            streak = 1
            for i in range(1, len(dates)):
                if dates[i - 1] - dates[i] == timedelta(days=1):
                    streak += 1
                else:
                    break

    # Compute score
    valence_component = max(0, min(30, int((avg_valence + 1) * 15)))  # 0-30
    regularity_component = min(30, int(regularity * 0.3))  # 0-30
    streak_component = min(20, streak * 2)  # 0-20
    evening_penalty = min(20, max(0, evening_pct - 30))  # 0-20 penalty
    score = min(
        100,
        valence_component
        + regularity_component
        + streak_component
        + 20
        - evening_penalty,
    )

    if score >= 75:
        category, tip = "thriving", "You're doing great! Keep nurturing your wellbeing."
    elif score >= 50:
        category, tip = (
            "balanced",
            "Good balance! Try adding a morning check-in routine.",
        )
    elif score >= 30:
        category, tip = (
            "needs_attention",
            "Consider setting aside 5 minutes daily for reflection.",
        )
    else:
        category, tip = (
            "at_risk",
            "Your patterns suggest you could benefit from regular self-care breaks.",
        )

    return WorkLifeScoreResponse(
        score=score,
        category=category,
        journal_regularity=regularity,
        avg_valence=round(avg_valence, 3),
        evening_entries_pct=evening_pct,
        streak_days=streak,
        tip=tip,
    )
