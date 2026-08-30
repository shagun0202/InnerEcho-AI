# ══════════════════════════════════════════════════════════════
# FILE: backend/app/routers/integrations.py
# 🔒 Privacy & Third-Party Integrations Router
# Manages least-privilege consents and Memory Moment data.
# ══════════════════════════════════════════════════════════════

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models import User, ConnectedIntegration
from app.services.google_service import GoogleService

router = APIRouter(prefix="/integrations", tags=["Privacy & Integrations"])


# ── Schemas ──────────────────────────────────────────────────────────────────
class IntegrationStatusResponse(BaseModel):
    google_connected: bool
    google_email: Optional[str] = None
    photos_enabled: bool
    contacts_enabled: bool
    scopes: List[str]


class PermissionsUpdateInput(BaseModel):
    photos_enabled: Optional[bool] = None
    contacts_enabled: Optional[bool] = None


# ── Endpoints ────────────────────────────────────────────────────────────────
@router.get("/status", response_model=IntegrationStatusResponse)
def get_integration_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the user's current connected accounts and granted permissions."""
    integration = (
        db.query(ConnectedIntegration)
        .filter(ConnectedIntegration.user_id == current_user.id, ConnectedIntegration.provider == "google")
        .first()
    )

    google_connected = bool(current_user.google_id or current_user.auth_provider == "google")
    photos_enabled = integration.photos_enabled if integration else False
    contacts_enabled = integration.contacts_enabled if integration else False
    scopes_str = integration.scopes if integration and integration.scopes else "openid email profile"

    return IntegrationStatusResponse(
        google_connected=google_connected,
        google_email=current_user.email if google_connected else None,
        photos_enabled=photos_enabled,
        contacts_enabled=contacts_enabled,
        scopes=scopes_str.split(),
    )


@router.post("/permissions", response_model=IntegrationStatusResponse)
def update_permissions(
    payload: PermissionsUpdateInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates user's granular consent for Google Photos and Google Contacts.
    Follows least-privilege principles.
    """
    integration = (
        db.query(ConnectedIntegration)
        .filter(ConnectedIntegration.user_id == current_user.id, ConnectedIntegration.provider == "google")
        .first()
    )

    if not integration:
        integration = ConnectedIntegration(
            user_id=current_user.id,
            provider="google",
            photos_enabled=False,
            contacts_enabled=False,
            scopes="openid email profile",
        )
        db.add(integration)

    current_scopes = set(integration.scopes.split() if integration.scopes else ["openid", "email", "profile"])

    if payload.photos_enabled is not None:
        integration.photos_enabled = payload.photos_enabled
        if payload.photos_enabled:
            current_scopes.add("https://www.googleapis.com/auth/photoslibrary.readonly")
        else:
            current_scopes.discard("https://www.googleapis.com/auth/photoslibrary.readonly")

    if payload.contacts_enabled is not None:
        integration.contacts_enabled = payload.contacts_enabled
        if payload.contacts_enabled:
            current_scopes.add("https://www.googleapis.com/auth/contacts.readonly")
        else:
            current_scopes.discard("https://www.googleapis.com/auth/contacts.readonly")

    integration.scopes = " ".join(sorted(current_scopes))
    db.commit()
    db.refresh(integration)

    return get_integration_status(current_user, db)


class GoogleConnectInput(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None


@router.post("/google/connect", response_model=IntegrationStatusResponse)
def connect_google_account(
    payload: GoogleConnectInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Connects/links a Google account to the existing authenticated user profile.
    """
    google_email = payload.email
    google_id = f"google_{current_user.id}"
    picture = None

    if payload.credential:
        try:
            info = GoogleService.verify_google_token(payload.credential)
            google_email = info.get("email") or google_email
            google_id = info.get("google_id") or google_id
            picture = info.get("picture")
        except Exception:
            pass

    if not google_email:
        google_email = current_user.email

    current_user.google_id = google_id
    if picture and not current_user.picture:
        current_user.picture = picture

    integration = (
        db.query(ConnectedIntegration)
        .filter(ConnectedIntegration.user_id == current_user.id, ConnectedIntegration.provider == "google")
        .first()
    )
    if not integration:
        integration = ConnectedIntegration(
            user_id=current_user.id,
            provider="google",
            photos_enabled=True,
            contacts_enabled=True,
            scopes="openid email profile https://www.googleapis.com/auth/photoslibrary.readonly https://www.googleapis.com/auth/contacts.readonly",
        )
        db.add(integration)
    else:
        integration.photos_enabled = True
        integration.contacts_enabled = True

    db.commit()
    db.refresh(current_user)
    return get_integration_status(current_user, db)


@router.delete("/disconnect", status_code=status.HTTP_204_NO_CONTENT)
def disconnect_google(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Disconnects Google account integration and purges connected permissions.
    """
    integrations = (
        db.query(ConnectedIntegration)
        .filter(ConnectedIntegration.user_id == current_user.id)
        .all()
    )
    for itg in integrations:
        db.delete(itg)

    if current_user.auth_provider == "google":
        # Keep user account but clear google_id linkage
        current_user.google_id = None

    db.commit()
    return None


from app.models import User, ConnectedIntegration, UserMemoryPhoto


class PhotoImportInput(BaseModel):
    title: str
    image_url: str
    reflection: Optional[str] = None
    category: Optional[str] = "personal"
    source: Optional[str] = "google_photos"


@router.get("/photos/memories")
def get_positive_memories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns user's Google Photos / personal memories merged with curated wellness memories.
    Respects user privacy: zero mass scanning or background indexing.
    """
    integration = (
        db.query(ConnectedIntegration)
        .filter(ConnectedIntegration.user_id == current_user.id, ConnectedIntegration.provider == "google")
        .first()
    )
    photos_connected = integration.photos_enabled if integration else False

    # Fetch user's saved/imported memories
    user_photos = (
        db.query(UserMemoryPhoto)
        .filter(UserMemoryPhoto.user_id == current_user.id)
        .order_by(UserMemoryPhoto.id.desc())
        .all()
    )

    formatted_user_photos = [
        {
            "id": f"user_photo_{p.id}",
            "db_id": p.id,
            "title": p.title,
            "date": p.created_at.strftime("%B %d, %Y"),
            "category": p.category or "uploads",
            "tag": "📸 My Google Photo" if p.source == "google_photos" else "📸 My Memory",
            "reflection": p.reflection or "A meaningful personal moment that brings me joy and calm.",
            "image_url": p.image_url,
            "isCustom": True,
            "source": p.source,
        }
        for p in user_photos
    ]

    live_google_photos = []
    if integration and integration.access_token and photos_connected:
        live_google_photos = GoogleService.fetch_user_google_photos(integration.access_token)

    curated_memories = GoogleService.get_curated_positive_memories()
    all_memories = live_google_photos + formatted_user_photos + curated_memories

    return {
        "photos_connected": photos_connected,
        "count": len(all_memories),
        "live_photos_count": len(live_google_photos),
        "user_photos_count": len(formatted_user_photos),
        "memories": all_memories,
    }


@router.post("/photos/import", status_code=status.HTTP_201_CREATED)
def import_user_photo(
    payload: PhotoImportInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Imports a photo from Google Photos or device into user's wellness memory collection.
    """
    photo = UserMemoryPhoto(
        user_id=current_user.id,
        title=payload.title.strip(),
        image_url=payload.image_url.strip(),
        reflection=payload.reflection.strip() if payload.reflection else None,
        category=payload.category or "personal",
        source=payload.source or "google_photos",
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)

    return {
        "success": True,
        "id": f"user_photo_{photo.id}",
        "db_id": photo.id,
        "title": photo.title,
        "image_url": photo.image_url,
        "reflection": photo.reflection,
    }


@router.delete("/photos/memories/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes a user-imported memory photo."""
    photo = (
        db.query(UserMemoryPhoto)
        .filter(UserMemoryPhoto.id == photo_id, UserMemoryPhoto.user_id == current_user.id)
        .first()
    )
    if photo:
        db.delete(photo)
        db.commit()
    return None
