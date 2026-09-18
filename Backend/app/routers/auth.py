from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models import User, WellnessProfile
from sqlalchemy.exc import IntegrityError
from app.schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=TokenResponse, status_code=201)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        name=payload.name,
        email=email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    try:
        db.flush()
        db.add(WellnessProfile(user_id=user.id))
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email already registered")
    db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(user.id),
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return TokenResponse(
        access_token=create_access_token(user.id),
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.get("/export")
def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """GDPR / Privacy Data Export: returns all personal records for this user."""
    from app.models import (
        WellnessProfile,
        JournalEntry,
        ChatMessage,
        WellnessCheckin,
        TrustedContact,
        UserAchievement,
        InterventionSession,
    )

    profile = db.query(WellnessProfile).filter_by(user_id=current_user.id).first()
    entries = db.query(JournalEntry).filter_by(user_id=current_user.id).all()
    chats = db.query(ChatMessage).filter_by(user_id=current_user.id).all()
    checkins = db.query(WellnessCheckin).filter_by(user_id=current_user.id).all()
    contacts = db.query(TrustedContact).filter_by(user_id=current_user.id).all()
    achievements = db.query(UserAchievement).filter_by(user_id=current_user.id).all()
    sessions = db.query(InterventionSession).filter_by(user_id=current_user.id).all()

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "auth_provider": current_user.auth_provider,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        },
        "profile": {
            "goals": profile.goals if profile else [],
            "preferred_types": profile.preferred_types if profile else [],
            "preferred_minutes": profile.preferred_minutes if profile else 5,
            "language": profile.language if profile else "en",
            "interests": profile.interests if profile else [],
            "city": profile.city if profile else None,
            "ai_consent": profile.ai_consent if profile else False,
        },
        "journal_entries": [
            {
                "id": e.id,
                "text": e.text,
                "emotion": e.analysis.dominant_emotion if e.analysis else None,
                "ai_reply": e.ai_reply,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }

            for e in entries
        ],
        "chat_messages": [
            {
                "id": m.id,
                "role": m.role,
                "text": m.text,
                "emotion": m.emotion,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in chats
        ],
        "checkins": [
            {
                "id": c.id,
                "mood": c.mood,
                "energy": c.energy,
                "stress": c.stress,
                "context": c.context,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in checkins
        ],
        "trusted_contacts": [
            {
                "role": tc.role,
                "name": tc.name,
                "phone": tc.phone,
                "email": tc.email,
            }
            for tc in contacts
        ],
        "sessions": [
            {
                "activity_key": s.activity_key,
                "activity_type": s.activity_type,
                "duration_seconds": s.duration_seconds,
                "status": s.status,
            }
            for s in sessions
        ],
        "achievements": [a.badge_id for a in achievements],
    }


@router.delete("/me", status_code=204)
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Permanently delete user account and cascade delete all associated data."""
    # Delete personal context FTS index entries if any
    try:
        from app.services.personal_context_service import get_personal_context_service

        get_personal_context_service().delete_user_context(db, current_user.id)
    except Exception:
        pass

    db.delete(current_user)
    db.commit()

