from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from app.dependencies import get_db, get_current_user
from app.models import User, TeamMood, Kudos, JournalEntry, EmotionAnalysis
from app.schemas import (
    TeamMoodInput, TeamMoodResponse, TeamMoodSummary,
    KudosInput, KudosResponse,
    MeetingRecoveryResponse, WorkLifeScoreResponse
)

router = APIRouter(prefix="/team", tags=["Team & Employee"])

# ── Team Mood Board ──────────────────────────────────────────

MOOD_SENTIMENT = {'great': 2, 'good': 1, 'okay': 0, 'rough': -1, 'struggling': -2}

@router.post("/mood", response_model=TeamMoodResponse, status_code=201)
def submit_team_mood(payload: TeamMoodInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Submit anonymous mood to the team board (once per day)."""
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    existing = db.query(TeamMood).filter(
        TeamMood.user_id == current_user.id,
        TeamMood.created_at >= today_start
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You've already shared your mood today")
    
    entry = TeamMood(user_id=current_user.id, mood=payload.mood, note=payload.note)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/mood/summary", response_model=TeamMoodSummary)
def get_team_mood_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get anonymous team mood summary for last 7 days."""
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    moods = db.query(TeamMood).filter(TeamMood.created_at >= week_ago).all()
    
    counts = {'great': 0, 'good': 0, 'okay': 0, 'rough': 0, 'struggling': 0}
    notes = []
    for m in moods:
        counts[m.mood] = counts.get(m.mood, 0) + 1
        if m.note:
            notes.append(m.note)
    
    # Average sentiment
    if moods:
        avg = sum(MOOD_SENTIMENT.get(m.mood, 0) for m in moods) / len(moods)
        sentiment = 'positive' if avg > 0.5 else 'needs_attention' if avg < -0.5 else 'neutral'
    else:
        sentiment = 'neutral'
    
    # Check if current user submitted today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    submitted = db.query(TeamMood).filter(
        TeamMood.user_id == current_user.id,
        TeamMood.created_at >= today_start
    ).first() is not None
    
    return TeamMoodSummary(
        total_submissions=len(moods),
        mood_counts=counts,
        average_sentiment=sentiment,
        recent_notes=notes[-10:],
        submitted_today=submitted
    )

# ── Kudos Wall ───────────────────────────────────────────────

@router.post("/kudos", response_model=KudosResponse, status_code=201)
def send_kudos(payload: KudosInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Send appreciation to a colleague."""
    entry = Kudos(
        sender_id=current_user.id,
        recipient_name=payload.recipient_name,
        message=payload.message,
        emoji=payload.emoji
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return KudosResponse(
        id=entry.id, sender_name=current_user.name,
        recipient_name=entry.recipient_name, message=entry.message,
        emoji=entry.emoji, created_at=entry.created_at
    )

@router.get("/kudos", response_model=list[KudosResponse])
def get_kudos_wall(limit: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get the latest kudos from everyone."""
    entries = db.query(Kudos).order_by(Kudos.created_at.desc()).limit(limit).all()
    return [
        KudosResponse(
            id=k.id, sender_name=k.sender.name,
            recipient_name=k.recipient_name, message=k.message,
            emoji=k.emoji, created_at=k.created_at
        ) for k in entries
    ]

# ── Meeting Recovery ─────────────────────────────────────────

RECOVERY_ACTIVITIES = [
    '🧘 Take 5 deep breaths with the 4-4-6 pattern',
    '🚶 Take a 3-minute walk, even just around the room',
    '💧 Drink a full glass of water mindfully',
    '👀 Look at something 20 feet away for 20 seconds (20-20-20 rule)',
    '✍️ Write one thing that went well in that meeting',
    '🎵 Listen to one song that makes you feel good',
    '🌿 Step outside for 60 seconds of fresh air',
    '🤸 Do 5 gentle stretches at your desk',
]

AFFIRMATIONS = [
    'You handled that well. Now take a moment for yourself.',
    'Meetings end, but your peace of mind doesn\'t have to.',
    'You showed up and contributed. That matters.',
    'Time to reset. The next task can wait 2 minutes.',
    'You deserve a micro-break. Your brain will thank you.',
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
        affirmation=affirmation
    )

# ── Work-Life Balance Score ──────────────────────────────────

@router.get("/work-life-score", response_model=WorkLifeScoreResponse)
def get_work_life_score(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Compute a work-life balance score based on journaling patterns."""
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    
    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id,
        JournalEntry.created_at >= thirty_days_ago
    ).all()
    
    total_days = 30
    entry_dates = set(e.created_at.date() for e in entries)
    regularity = int((len(entry_dates) / total_days) * 100)
    
    # Average valence
    analyses = []
    for e in entries:
        a = db.query(EmotionAnalysis).filter(EmotionAnalysis.entry_id == e.id).first()
        if a:
            analyses.append(a)
    avg_valence = sum(a.valence_score for a in analyses) / len(analyses) if analyses else 0.0
    
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
                if dates[i-1] - dates[i] == timedelta(days=1):
                    streak += 1
                else:
                    break
    
    # Compute score
    valence_component = max(0, min(30, int((avg_valence + 1) * 15)))  # 0-30
    regularity_component = min(30, int(regularity * 0.3))             # 0-30
    streak_component = min(20, streak * 2)                             # 0-20
    evening_penalty = min(20, max(0, evening_pct - 30))               # 0-20 penalty
    score = min(100, valence_component + regularity_component + streak_component + 20 - evening_penalty)
    
    if score >= 75:
        category, tip = 'thriving', 'You\'re doing great! Keep nurturing your wellbeing.'
    elif score >= 50:
        category, tip = 'balanced', 'Good balance! Try adding a morning check-in routine.'
    elif score >= 30:
        category, tip = 'needs_attention', 'Consider setting aside 5 minutes daily for reflection.'
    else:
        category, tip = 'at_risk', 'Your patterns suggest you could benefit from regular self-care breaks.'
    
    return WorkLifeScoreResponse(
        score=score, category=category, journal_regularity=regularity,
        avg_valence=round(avg_valence, 3), evening_entries_pct=evening_pct,
        streak_days=streak, tip=tip
    )
