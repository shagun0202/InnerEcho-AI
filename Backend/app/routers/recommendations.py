# ══════════════════════════════════════════════════════════════
# FILE: backend/app/routers/recommendations.py
# 🆕 Rate a recommendation (feeds the learning layer)
# ══════════════════════════════════════════════════════════════

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models import User, JournalEntry, Recommendation
from app.schemas import RatingInput, RecommendationResponse, ActivityResponse

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.post("/{rec_id}/rate", response_model=RecommendationResponse)
def rate_recommendation(
    rec_id: int,
    payload: RatingInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rec = (
        db.query(Recommendation)
        .join(JournalEntry, Recommendation.entry_id == JournalEntry.id)
        .filter(Recommendation.id == rec_id,
                JournalEntry.user_id == current_user.id)  # 🔒 own recs only
        .first()
    )
    if rec is None:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.rating = payload.rating
    db.commit()
    db.refresh(rec)
    return RecommendationResponse(
        id=rec.id, activity=ActivityResponse.model_validate(rec.activity)
    )
