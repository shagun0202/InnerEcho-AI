from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models import QuickMood, User
from app.schemas import QuickMoodInput, QuickMoodResponse


router = APIRouter(prefix="/mood", tags=["Quick Mood"])


@router.post("/quick", response_model=QuickMoodResponse, status_code=201)
def save_quick_mood(
    payload: QuickMoodInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save a private lightweight check-in without creating a full journal entry."""
    check_in = QuickMood(user_id=current_user.id, mood=payload.mood, note=payload.note)
    db.add(check_in)
    db.commit()
    db.refresh(check_in)
    return check_in
