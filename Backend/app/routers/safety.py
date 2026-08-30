# ══════════════════════════════════════════════════════════════
# FILE: backend/app/routers/safety.py
# 🛡️ Safety Assessment, Trusted Contact & Emergency Alert Router
# ══════════════════════════════════════════════════════════════

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models import User, TrustedContact, SafetyEvent
from app.services.safety_service import assess_safety
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/safety", tags=["Safety & Trusted Contacts"])


# ── Schemas ──────────────────────────────────────────────────────────────────
class TrustedContactInput(BaseModel):
    name: str
    relationship_type: str
    phone: str
    email: Optional[str] = None
    notification_mode: str = "ask"  # 'never', 'ask', 'automatic'


class TrustedContactResponse(BaseModel):
    id: int
    name: str
    relationship_type: str
    phone: str
    email: Optional[str] = None
    notification_mode: str
    created_at: datetime

    class Config:
        from_attributes = True


class SafetyEvaluationInput(BaseModel):
    text: str
    source: str = "journal"  # 'journal', 'chat', or 'checkin'


class SafetyEvaluationResponse(BaseModel):
    risk_level: str
    score: float
    action_required: bool
    explanation: str
    guidance: str
    resources: List[Dict[str, Any]]
    contact_available: bool
    contact_name: Optional[str] = None
    notification_mode: Optional[str] = None


class SafetyNotifyInput(BaseModel):
    reason: str = "User requested check-in"


class SafetyNotifyResponse(BaseModel):
    success: bool
    message: str
    recipient: str


# ── Endpoints ────────────────────────────────────────────────────────────────
@router.get("/contact", response_model=Optional[TrustedContactResponse])
def get_trusted_contact(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetch the authenticated user's configured trusted contact."""
    contact = db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).first()
    if not contact:
        return None
    return TrustedContactResponse.model_validate(contact)


@router.post("/contact", response_model=TrustedContactResponse, status_code=status.HTTP_201_CREATED)
def set_trusted_contact(
    payload: TrustedContactInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Configure or update the user's trusted emergency/wellness contact."""
    if payload.notification_mode not in {"never", "ask", "automatic"}:
        payload.notification_mode = "ask"

    contact = db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).first()
    if contact:
        contact.name = payload.name.strip()
        contact.relationship_type = payload.relationship_type.strip()
        contact.phone = payload.phone.strip()
        contact.email = payload.email.strip() if payload.email else None
        contact.notification_mode = payload.notification_mode
    else:
        contact = TrustedContact(
            user_id=current_user.id,
            name=payload.name.strip(),
            relationship_type=payload.relationship_type.strip(),
            phone=payload.phone.strip(),
            email=payload.email.strip() if payload.email else None,
            notification_mode=payload.notification_mode,
        )
        db.add(contact)

    db.commit()
    db.refresh(contact)
    return TrustedContactResponse.model_validate(contact)


@router.delete("/contact", status_code=status.HTTP_204_NO_CONTENT)
def delete_trusted_contact(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove configured trusted contact."""
    contact = db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).first()
    if contact:
        db.delete(contact)
        db.commit()
    return None


@router.post("/evaluate", response_model=SafetyEvaluationResponse)
def evaluate_text_safety(
    payload: SafetyEvaluationInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Evaluates text for multi-tier safety risk signals.
    If high or critical, logs a safety event for auditing.
    """
    assessment = assess_safety(payload.text)
    contact = db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).first()

    # Log safety event if high/critical
    if assessment["risk_level"] in {"high", "critical"}:
        event = SafetyEvent(
            user_id=current_user.id,
            risk_level=assessment["risk_level"],
            trigger_source=payload.source,
            notified_contact=False,
        )
        db.add(event)
        db.commit()

    return SafetyEvaluationResponse(
        risk_level=assessment["risk_level"],
        score=assessment["score"],
        action_required=assessment["action_required"],
        explanation=assessment["explanation"],
        guidance=assessment["guidance"],
        resources=assessment["resources"],
        contact_available=bool(contact),
        contact_name=contact.name if contact else None,
        notification_mode=contact.notification_mode if contact else None,
    )


@router.post("/notify", response_model=SafetyNotifyResponse)
def notify_trusted_contact(
    payload: SafetyNotifyInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Dispatches a privacy-preserving safety check-in alert to the trusted contact.
    Never transmits private journals, thoughts, or chat messages.
    """
    contact = db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).first()
    if not contact:
        raise HTTPException(status_code=400, detail="No trusted contact configured.")

    result = NotificationService.send_trusted_contact_alert(
        user_name=current_user.name,
        contact_name=contact.name,
        contact_phone=contact.phone,
        contact_email=contact.email,
    )

    # Record notification in the most recent safety event log
    latest_event = (
        db.query(SafetyEvent)
        .filter(SafetyEvent.user_id == current_user.id)
        .order_by(SafetyEvent.id.desc())
        .first()
    )
    if latest_event:
        latest_event.notified_contact = True
        db.commit()

    return SafetyNotifyResponse(
        success=result["delivered"],
        message=f"Safety check-in alert sent to {contact.name}.",
        recipient=f"{contact.name} ({contact.phone})",
    )
