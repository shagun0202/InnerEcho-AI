"""Identity only. Google private-data access is deliberately not enabled."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models import User, ConnectedIntegration

router = APIRouter(prefix="/integrations", tags=["Integrations"])


@router.get("/status")
def status(user: User = Depends(get_current_user)):
    return dict(
        google_connected=bool(user.google_id),
        photos_enabled=False,
        contacts_enabled=False,
        scopes=["openid", "email", "profile"] if user.google_id else [],
        photos_status="unavailable",
        contacts_status="unavailable",
    )


@router.delete("/disconnect", status_code=204)
def disconnect(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.password_hash:
        raise HTTPException(
            409,
            "Google is your only sign-in method. Keep it connected to retain account access.",
        )
    user.google_id = None
    db.query(ConnectedIntegration).filter_by(user_id=user.id).delete()
    db.commit()


@router.get("/places")
async def get_places(
    emotion: str = "neutral",
    lat: float | None = None,
    lng: float | None = None,
    user: User = Depends(get_current_user),
):
    """Return real nearby places based on emotion and optional coordinates."""
    from app.services.places_service import get_nearby_places

    return await get_nearby_places(emotion=emotion, latitude=lat, longitude=lng)


@router.get("/music")
def get_music(
    emotion: str = "neutral",
    user: User = Depends(get_current_user),
):
    """Return real Spotify / YouTube playlists based on emotion."""
    from app.services.music_service import get_music_recommendations

    return get_music_recommendations(emotion=emotion)

