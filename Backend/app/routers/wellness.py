from datetime import datetime, timezone
import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.dependencies import get_db, get_current_user
from app.models import User, WellnessPlan, WellnessCheckin, InterventionSession
from app.wellness_schemas import (
    ProfileInput,
    CheckinInput,
    StartInput,
    ProgressInput,
    CompleteInput,
)
from app.services.catalog import CATALOG, BY_ID
from app.services.wellness_service import (
    get_profile,
    coordinate,
    plan_response,
    session_response,
    progress_summary,
    rank_activities,
)

router = APIRouter(prefix="/wellness", tags=["Wellness coordinator"])
logger = logging.getLogger(__name__)


def own(db, model, key, user_id):
    item = db.query(model).filter_by(id=key, user_id=user_id).first()
    if not item:
        raise HTTPException(404, "Item not found")
    return item


@router.get("/profile", response_model=ProfileInput)
def profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    result = get_profile(db, user.id)
    db.commit()
    return result


@router.put("/profile", response_model=ProfileInput)
def save_profile(
    payload: ProfileInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = get_profile(db, user.id)
    for key, value in payload.model_dump().items():
        setattr(result, key, value)
    db.commit()
    return result


@router.get("/catalog")
def catalog(user: User = Depends(get_current_user)):
    return CATALOG


@router.post("/checkins", status_code=201)
def checkin(
    payload: CheckinInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    plan = coordinate(db, user.id, payload)
    db.commit()
    return plan_response(plan)


@router.post("/plans/{plan_id}/change")
def change(
    plan_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    plan = own(db, WellnessPlan, plan_id, user.id)
    if plan.status != "suggested":
        raise HTTPException(409, "This plan cannot be changed")
    checkin = db.get(WellnessCheckin, plan.checkin_id)
    profile = get_profile(db, user.id)
    candidates = rank_activities(
        db,
        user.id,
        checkin,
        checkin.context,
        profile,
        checkin.available_minutes or BY_ID[plan.activity_key]["minutes"],
    )
    keys = [a["id"] for a in candidates]
    plan.activity_key = (
        keys[(keys.index(plan.activity_key) + 1) % len(keys)]
        if plan.activity_key in keys
        else keys[0]
    )
    plan.rationale = "An alternative within your available time. You control which activity fits this moment."
    plan.trace = [
        *plan.trace,
        dict(stage="Change", detail="You requested a different activity."),
    ]
    db.commit()
    return plan_response(plan)


@router.post("/plans/{plan_id}/dismiss", status_code=204)
def dismiss(
    plan_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    plan = own(db, WellnessPlan, plan_id, user.id)
    if plan.status == "suggested":
        plan.status = "dismissed"
        db.commit()


from pydantic import BaseModel

class DismissInput(BaseModel):
    recommendation_id: str
    reason: str | None = None

@router.post("/dismiss", status_code=204)
def dismiss_recommendation(
    payload: DismissInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from app.models import DismissedRecommendation
    dismissal = DismissedRecommendation(
        user_id=user.id,
        activity_key=payload.recommendation_id
    )
    db.add(dismissal)
    db.commit()


@router.get("/summary")
def summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    result = progress_summary(db, user.id)
    db.commit()
    return result


@router.get("/sessions")
def sessions(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return [
        session_response(s)
        for s in db.query(InterventionSession)
        .filter_by(user_id=user.id)
        .order_by(InterventionSession.id.desc())
        .limit(limit)
    ]


@router.post("/sessions", status_code=201)
def start(
    payload: StartInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    activity = BY_ID.get(payload.activity_key)
    if not activity:
        raise HTTPException(422, "Unknown activity")
    if payload.plan_id:
        plan = own(db, WellnessPlan, payload.plan_id, user.id)
        existing = (
            db.query(InterventionSession)
            .filter_by(plan_id=plan.id, user_id=user.id)
            .first()
        )
        if existing:
            return session_response(existing)
        if plan.status != "suggested" or plan.activity_key != payload.activity_key:
            raise HTTPException(409, "Plan is no longer available")
        plan.status = "started"
    active = (
        db.query(InterventionSession)
        .filter_by(user_id=user.id, status="active")
        .first()
    )
    if active:
        raise HTTPException(
            409, "Resume or end your current session before starting another"
        )
    session = InterventionSession(
        user_id=user.id,
        plan_id=payload.plan_id,
        activity_key=activity["id"],
        activity_type=activity["type"],
        duration_seconds=activity["minutes"] * 60,
        mood_before=payload.mood_before,
    )
    db.add(session)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        if payload.plan_id:
            existing = (
                db.query(InterventionSession)
                .filter_by(plan_id=payload.plan_id, user_id=user.id)
                .first()
            )
            if existing:
                return session_response(existing)
        raise HTTPException(
            409, "A session was already started. Resume it before starting another."
        )
    db.refresh(session)
    return session_response(session)


def update_elapsed(session, elapsed):
    wall = (
        datetime.now(timezone.utc) - session.started_at.replace(tzinfo=timezone.utc)
    ).total_seconds()
    if elapsed > session.duration_seconds or elapsed > wall + 3:
        raise HTTPException(422, "Session time is inconsistent. Resume and try again.")
    session.elapsed_seconds = max(session.elapsed_seconds, elapsed)


@router.patch("/sessions/{session_id}")
def progress(
    session_id: int,
    payload: ProgressInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    session = own(db, InterventionSession, session_id, user.id)
    if session.status != "active":
        raise HTTPException(409, "Session has ended")
    update_elapsed(session, payload.elapsed_seconds)
    db.commit()
    return session_response(session)


@router.post("/sessions/{session_id}/complete")
def complete(
    session_id: int,
    payload: CompleteInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    session = own(db, InterventionSession, session_id, user.id)
    if session.status == "completed":
        return session_response(session)
    if session.status != "active":
        raise HTTPException(409, "Session has ended")
    update_elapsed(session, payload.elapsed_seconds)
    if session.elapsed_seconds < session.duration_seconds:
        raise HTTPException(422, "Finish the session timer before recording completion")
    session.mood_after = payload.mood_after
    session.helpful = payload.helpful
    session.status = "completed"
    session.completed_at = datetime.now(timezone.utc)
    db.commit()
    logger.info("intervention_completed type=%s", session.activity_type)
    return session_response(session)


@router.post("/sessions/{session_id}/abandon", status_code=204)
def abandon(
    session_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    session = own(db, InterventionSession, session_id, user.id)
    if session.status == "active":
        session.status = "abandoned"
        db.commit()


@router.post("/dismiss", status_code=204)
def dismiss_recommendation(
    payload: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Dismiss a recommendation for 24 hours so it isn't re-suggested."""
    from app.models import DismissedRecommendation

    rec_id = payload.get("recommendation_id")
    if not rec_id:
        raise HTTPException(400, "recommendation_id required")
    dismissal = DismissedRecommendation(
        user_id=user.id,
        activity_key=rec_id,
    )
    db.add(dismissal)
    db.commit()

