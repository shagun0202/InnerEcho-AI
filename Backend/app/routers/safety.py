# ══════════════════════════════════════════════════════════════
# FILE: backend/app/routers/safety.py
# 🛡️ Safety Assessment, Trusted Contact & Emergency Alert Router
# ══════════════════════════════════════════════════════════════

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models import User, TrustedContact, SafetyEvent
from app.schemas import TrustedContactInput, TrustedContactResponse
from app.services.safety_service import assess_safety
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/safety", tags=["Safety & Trusted Contacts"])


# ── Schemas ──────────────────────────────────────────────────────────────────


class SafetyEvaluationInput(BaseModel):
    text: str = Field(max_length=5000)
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
@router.get("/contacts", response_model=List[TrustedContactResponse])
def get_all_trusted_contacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetch all of the authenticated user's configured trusted contacts."""
    contacts = (
        db.query(TrustedContact)
        .filter(TrustedContact.user_id == current_user.id)
        .all()
    )
    return [TrustedContactResponse.model_validate(c) for c in contacts]


@router.get("/contact", response_model=Optional[TrustedContactResponse])
def get_trusted_contact(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetch the authenticated user's default trusted contact."""
    contact = (
        db.query(TrustedContact)
        .filter(TrustedContact.user_id == current_user.id, TrustedContact.role == "trusted_contact")
        .first()
    )
    if not contact:
        return None
    return TrustedContactResponse.model_validate(contact)


@router.post(
    "/contact",
    response_model=TrustedContactResponse,
    status_code=status.HTTP_201_CREATED,
)
def set_trusted_contact(
    payload: TrustedContactInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Configure or update the user's trusted emergency/wellness contact."""
    contact = (
        db.query(TrustedContact)
        .filter(TrustedContact.user_id == current_user.id, TrustedContact.role == payload.role)
        .first()
    )
    if contact:
        contact.name = payload.name.strip()
        contact.phone = payload.phone.strip() if payload.phone else ""
        contact.email = payload.email.strip() if payload.email else None
    else:
        # Enforce max 3 contacts limit
        count = db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).count()
        if count >= 3:
            raise HTTPException(400, "Maximum of 3 trusted contacts allowed.")
        
        contact = TrustedContact(
            user_id=current_user.id,
            role=payload.role,
            name=payload.name.strip(),
            relationship_type=payload.role.replace("_", " ").title(),
            phone=payload.phone.strip() if payload.phone else "",
            email=payload.email.strip() if payload.email else None,
            notification_mode="ask",
        )
        db.add(contact)

    db.commit()
    db.refresh(contact)
    return TrustedContactResponse.model_validate(contact)

@router.put("/contact/{role}", response_model=TrustedContactResponse)
def update_trusted_contact_by_role(
    role: str,
    payload: TrustedContactInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if role not in ["trusted_contact", "best_friend", "family"]:
        raise HTTPException(400, "Invalid role")
    payload.role = role
    return set_trusted_contact(payload, current_user, db)


@router.delete("/contact/{role}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trusted_contact_by_role(
    role: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    contact = (
        db.query(TrustedContact)
        .filter(TrustedContact.user_id == current_user.id, TrustedContact.role == role)
        .first()
    )
    if contact:
        db.delete(contact)
        db.commit()
    return None


@router.delete("/contact", status_code=status.HTTP_204_NO_CONTENT)
def delete_trusted_contact(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove configured default trusted contact."""
    contact = (
        db.query(TrustedContact)
        .filter(TrustedContact.user_id == current_user.id, TrustedContact.role == "trusted_contact")
        .first()
    )
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
    contact = (
        db.query(TrustedContact)
        .filter(TrustedContact.user_id == current_user.id)
        .first()
    )

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
    contact = (
        db.query(TrustedContact)
        .filter(TrustedContact.user_id == current_user.id)
        .first()
    )
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
        latest_event.notified_contact = result["delivered"]
        db.commit()

    return SafetyNotifyResponse(
        success=result["delivered"],
        message=result["message_summary"],
        recipient=f"{contact.name} ({contact.phone})",
    )
