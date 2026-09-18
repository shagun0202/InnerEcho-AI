# ══════════════════════════════════════════════════════════════
# FILE: backend/app/routers/journal.py
# ✏️ FULL REPLACEMENT — now returns AI reply + recommendations
# ══════════════════════════════════════════════════════════════

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models import User, JournalEntry, EmotionAnalysis, Recommendation
from app.schemas import (
    JournalInput,
    JournalResponse,
    RecommendationResponse,
    ActivityResponse,
)
from app.services.emotion_service import get_emotion_service, EmotionService
from app.services.gemini_service import get_gemini_service
from app.services.recommender import get_recommendations
from app.services.wellness_service import coordinate, plan_response, get_profile
from app.services.safety_service import assess_safety
from app.wellness_schemas import CheckinInput

router = APIRouter(prefix="/journal", tags=["Journal"])


def to_response(entry: JournalEntry) -> JournalResponse:
    a = entry.analysis
    return JournalResponse(
        id=entry.id,
        text=entry.text,
        created_at=entry.created_at,
        emotions=a.emotions_json,
        dominant_emotion=a.dominant_emotion,
        confidence=a.confidence,
        valence_score=a.valence_score,
        ai_reply=entry.ai_reply,
        recommendations=[
            RecommendationResponse(
                id=r.id, activity=ActivityResponse.model_validate(r.activity)
            )
            for r in entry.recommendations
        ],
    )


@router.post("", response_model=JournalResponse, status_code=201)
def create_journal(
    payload: JournalInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """The complete MoodMentor pipeline: AI analysis → empathetic reply
    → personalized recommendations → store everything."""
    # 1️⃣ Emotion AI
    safety = assess_safety(payload.text)
    critical = safety["risk_level"] in {"high", "critical"}
    result = (
        EmotionService.local_analysis(payload.text)
        if critical
        else get_emotion_service().analyze(payload.text)
    )

    # 2️⃣ Gemini empathetic reply (auto-fallback if unavailable)
    profile = get_profile(db, current_user.id)
    ai_reply = (
        safety["guidance"]
        if critical
        else get_gemini_service().generate_empathetic_reply(
            text=payload.text,
            dominant_emotion=result["dominant_emotion"],
            confidence=result["confidence"],
            ai_allowed=profile.ai_consent,
        )
    )

    # 3️⃣ Save entry + analysis
    entry = JournalEntry(user_id=current_user.id, text=payload.text, ai_reply=ai_reply)
    entry.analysis = EmotionAnalysis(
        emotions_json=result["emotions"],
        dominant_emotion=result["dominant_emotion"],
        confidence=result["confidence"],
        valence_score=result["valence_score"],
    )
    db.add(entry)
    db.flush()
    db.refresh(entry)

    # 4️⃣ Personalized recommendations
    activities = get_recommendations(db, current_user.id, result["emotions"])
    for act in activities:
        db.add(Recommendation(entry_id=entry.id, activity_id=act.id))
    db.flush()
    db.refresh(entry)

    plan = coordinate(
        db,
        current_user.id,
        CheckinInput(
            text=payload.text, source="journal", mood=None, energy=None, stress=None
        ),
        analysis=result,
    )
    db.commit()
    response = to_response(entry)
    response.analysis_method = result["analysis_method"]
    response.wellness_plan = plan_response(plan)
    return response


# ⚠️ /history must stay ABOVE /{entry_id}
@router.get("/history", response_model=list[JournalResponse])
def get_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == current_user.id)
        .order_by(JournalEntry.created_at.desc())
        .limit(limit)
        .all()
    )
    return [to_response(e) for e in entries]


@router.get("/{entry_id}", response_model=JournalResponse)
def get_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == current_user.id,
        )
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return to_response(entry)


@router.delete("/{entry_id}", status_code=204)
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == current_user.id,
        )
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
