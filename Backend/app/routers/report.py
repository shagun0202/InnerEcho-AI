from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from app.dependencies import get_db, get_current_user
from app.models import User, JournalEntry, EmotionAnalysis
from app.schemas import WeeklyReportResponse
from app.services.gemini_service import get_gemini_service
from app.config import GEMINI_MODEL

router = APIRouter(prefix="/report", tags=["Report"])

REPORT_PROMPT = """You are MoodMentor, generating a weekly emotional wellness report for an employee.

Here are this week's stats:
- Total reflections: {total}
- Average mood valence: {avg_valence:.2f} (scale: -1 very negative to +1 very positive)
- Most frequent emotion: {dominant}
- Emotion breakdown: {distribution}
- Streak: {streak} days

Write a warm, encouraging weekly wellness summary in this format:
1. NARRATIVE (3-4 sentences): Summarize their emotional week. Be specific about patterns.
2. HIGHLIGHTS (2-3 bullet points): Key wins or observations.
3. SUGGESTION (1 sentence): One actionable tip for next week.

Separate sections with these exact markers: ---NARRATIVE--- ---HIGHLIGHTS--- ---SUGGESTION---
Be warm, human, and encouraging. Never diagnose. Never give medical advice."""


@router.get("/weekly", response_model=WeeklyReportResponse)
def get_weekly_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Generate a Gemini-powered weekly wellness report."""
    now = datetime.now(timezone.utc)
    week_start = (now - timedelta(days=7)).date()
    week_end = now.date()
    
    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id,
        JournalEntry.created_at >= datetime.combine(week_start, datetime.min.time())
    ).all()
    
    total = len(entries)
    
    # Compute stats
    analyses = []
    for e in entries:
        a = db.query(EmotionAnalysis).filter(EmotionAnalysis.entry_id == e.id).first()
        if a:
            analyses.append(a)
    
    avg_valence = sum(a.valence_score for a in analyses) / len(analyses) if analyses else 0.0
    
    # Emotion distribution
    dist = {}
    for a in analyses:
        dist[a.dominant_emotion] = dist.get(a.dominant_emotion, 0) + 1
    dominant = max(dist, key=dist.get) if dist else 'neutral'
    
    # Try Gemini for narrative
    gemini = get_gemini_service()
    prompt = REPORT_PROMPT.format(
        total=total, avg_valence=avg_valence, dominant=dominant,
        distribution=str(dist), streak=0  # streak computed separately
    )
    
    narrative = "This week you made time to check in with yourself, and that matters."
    highlights = ["You showed up for yourself this week."]
    suggestion = "Try starting tomorrow with one thing you're grateful for."
    
    try:
        if gemini.client is None:
            raise RuntimeError("Gemini is unavailable")
        response = gemini.client.models.generate_content(
            model=GEMINI_MODEL, contents=prompt
        )
        text = response.text
        if '---NARRATIVE---' in text:
            parts = text.split('---')
            for i, part in enumerate(parts):
                if 'NARRATIVE' in part and i + 1 < len(parts):
                    narrative = parts[i + 1].strip()
                elif 'HIGHLIGHTS' in part and i + 1 < len(parts):
                    raw = parts[i + 1].strip()
                    highlights = [h.strip().lstrip('•-* ') for h in raw.split('\n') if h.strip()]
                elif 'SUGGESTION' in part and i + 1 < len(parts):
                    suggestion = parts[i + 1].strip()
        else:
            narrative = text[:500]
    except Exception:
        pass  # Use fallback values
    
    return WeeklyReportResponse(
        week_start=str(week_start), week_end=str(week_end),
        total_entries=total, avg_valence=round(avg_valence, 3),
        dominant_emotion=dominant, emotion_distribution=dist,
        narrative=narrative, highlights=highlights, suggestion=suggestion
    )
