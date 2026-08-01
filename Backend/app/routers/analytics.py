# ══════════════════════════════════════════════════════════════
# FILE: backend/app/routers/analytics.py
# 🆕 NEW FILE — all dashboard data endpoints
# ══════════════════════════════════════════════════════════════

from collections import Counter
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models import User, JournalEntry
from app.schemas import DailyStat, DistributionResponse, SummaryResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _user_entries(db: Session, user_id: int, since: datetime | None = None):
    q = db.query(JournalEntry).filter(JournalEntry.user_id == user_id)
    if since:
        q = q.filter(JournalEntry.created_at >= since)
    return q.order_by(JournalEntry.created_at.asc()).all()


def _daily_stats(entries) -> list[DailyStat]:
    """Group entries by day → avg valence + dominant emotion per day."""
    daily: dict[str, list] = {}
    for e in entries:
        daily.setdefault(e.created_at.date().isoformat(), []).append(e)

    stats = []
    for day, items in sorted(daily.items()):
        avg_val = sum(i.analysis.valence_score for i in items) / len(items)
        dom = Counter(i.analysis.dominant_emotion for i in items).most_common(1)[0][0]
        stats.append(DailyStat(date=day, avg_valence=round(avg_val, 3),
                               dominant_emotion=dom, entries=len(items)))
    return stats


@router.get("/summary", response_model=SummaryResponse)
def summary(db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    """Headline numbers for the dashboard stat cards."""
    entries = _user_entries(db, current_user.id)
    total = len(entries)

    # 🔥 Streak: consecutive days with ≥1 entry (today or yesterday counts as start)
    entry_dates = {e.created_at.date() for e in entries}
    today = datetime.utcnow().date()
    streak = 0
    cursor = today if today in entry_dates else today - timedelta(days=1)
    while cursor in entry_dates:
        streak += 1
        cursor -= timedelta(days=1)

    # 📈 Trend: last 7 days vs previous 7 days
    now = datetime.utcnow()
    last7 = [e.analysis.valence_score for e in entries
             if e.created_at >= now - timedelta(days=7)]
    prev7 = [e.analysis.valence_score for e in entries
             if now - timedelta(days=14) <= e.created_at < now - timedelta(days=7)]
    recent_avg = sum(last7) / len(last7) if last7 else 0.0
    prev_avg = sum(prev7) / len(prev7) if prev7 else recent_avg
    diff = recent_avg - prev_avg
    trend = "improving" if diff > 0.05 else "declining" if diff < -0.05 else "steady"

    most_common = Counter(e.analysis.dominant_emotion for e in entries).most_common(1)
    all_val = [e.analysis.valence_score for e in entries]

    return SummaryResponse(
        total_entries=total,
        streak_days=streak,
        most_frequent_emotion=most_common[0][0] if most_common else None,
        avg_valence_all_time=round(sum(all_val) / len(all_val), 3) if all_val else 0.0,
        recent_avg_valence=round(recent_avg, 3),
        previous_avg_valence=round(prev_avg, 3),
        trend=trend,
    )


@router.get("/trends", response_model=list[DailyStat])
def trends(days: int = 30, db: Session = Depends(get_db),
           current_user: User = Depends(get_current_user)):
    """Daily mood points for the line chart."""
    since = datetime.utcnow() - timedelta(days=days)
    return _daily_stats(_user_entries(db, current_user.id, since))


@router.get("/heatmap", response_model=list[DailyStat])
def heatmap(days: int = 365, db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    """Daily moods for the calendar heatmap."""
    since = datetime.utcnow() - timedelta(days=days)
    return _daily_stats(_user_entries(db, current_user.id, since))


@router.get("/distribution", response_model=DistributionResponse)
def distribution(days: int = 30, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    """Emotion mix for the doughnut chart."""
    since = datetime.utcnow() - timedelta(days=days)
    entries = _user_entries(db, current_user.id, since)

    counts = Counter(e.analysis.dominant_emotion for e in entries)
    totals: dict[str, float] = {}
    for e in entries:
        for emo, score in e.analysis.emotions_json.items():
            totals[emo] = totals.get(emo, 0) + score

    n = len(entries)
    return DistributionResponse(
        total_entries=n,
        dominant_counts=dict(counts),
        average_emotions={k: round(v / n, 4) for k, v in totals.items()} if n else {},
    )
