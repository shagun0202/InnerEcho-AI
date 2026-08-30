# ══════════════════════════════════════════════════════════════
# FILE: backend/app/routers/google_auth.py
# 🌐 Google OAuth 2.0 Identity & Authentication Router
# ══════════════════════════════════════════════════════════════

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import urllib.parse
from app.config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
from app.dependencies import get_db
from app.models import User, ConnectedIntegration
from app.schemas import TokenResponse, UserResponse
from app.services.auth_service import create_access_token
from app.services.google_service import GoogleService

router = APIRouter(prefix="/auth/google", tags=["Google OAuth"])


class GoogleAuthPayload(BaseModel):
    credential: str  # Google ID token or authorization credential


class GoogleConfigResponse(BaseModel):
    client_id: str
    enabled: bool


@router.get("/config", response_model=GoogleConfigResponse)
def get_google_config():
    """Returns Google Client ID and status for the frontend."""
    return GoogleConfigResponse(
        client_id=GOOGLE_CLIENT_ID,
        enabled=bool(GOOGLE_CLIENT_ID),
    )


@router.get("/url")
def get_google_auth_url():
    """Generates official Google OAuth 2.0 authorization URL."""
    if not GOOGLE_CLIENT_ID:
        return {"url": None, "configured": False}
    
    scope = "openid email profile"
    params = urllib.parse.urlencode({
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": scope,
        "access_type": "offline",
        "prompt": "consent",
    })
    return {"url": f"https://accounts.google.com/o/oauth2/v2/auth?{params}", "configured": True}


@router.post("", response_model=TokenResponse)
def google_authenticate(payload: GoogleAuthPayload, db: Session = Depends(get_db)):
    """
    Verifies Google credentials, connects/creates MoodMentor user,
    and returns a standard MoodMentor JWT token.
    """
    try:
        user_info = GoogleService.verify_google_token(payload.credential)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    email = user_info["email"].strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if user:
        # Existing user: link Google ID and update picture if available
        if not user.google_id:
            user.google_id = user_info.get("google_id")
        if user_info.get("picture") and not user.picture:
            user.picture = user_info.get("picture")
        db.commit()
        db.refresh(user)
    else:
        # Create new Google OAuth user
        user = User(
            name=user_info.get("name", "User"),
            email=email,
            password_hash=None,
            google_id=user_info.get("google_id"),
            picture=user_info.get("picture"),
            auth_provider="google",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Initialize base connection entry
        integration = ConnectedIntegration(
            user_id=user.id,
            provider="google",
            photos_enabled=False,
            contacts_enabled=False,
            scopes="openid email profile",
        )
        db.add(integration)
        db.commit()

    return TokenResponse(
        access_token=create_access_token(user.id),
        user=UserResponse.model_validate(user),
    )


@router.post("/callback", response_model=TokenResponse)
def google_oauth_callback(payload: dict, db: Session = Depends(get_db)):
    """
    Exchanges Google OAuth code for live access tokens and user profile,
    storing the real access token for Google Photos API.
    """
    code = payload.get("code")
    if not code or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=400, detail="Missing authorization code or client secret.")

    try:
        import json
        token_url = "https://oauth2.googleapis.com/token"
        data = urllib.parse.urlencode({
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }).encode("utf-8")

        req = urllib.request.Request(token_url, data=data, headers={"Content-Type": "application/x-www-form-urlencoded"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            tokens = json.loads(resp.read().decode("utf-8"))

        id_token = tokens.get("id_token")
        access_token = tokens.get("access_token")
        user_info = GoogleService.verify_google_token(id_token)
        email = user_info["email"].strip().lower()

        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                name=user_info.get("name", "User"),
                email=email,
                password_hash=None,
                google_id=user_info.get("google_id"),
                picture=user_info.get("picture"),
                auth_provider="google",
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Store real Google access token for Photos & Contacts
        integration = (
            db.query(ConnectedIntegration)
            .filter(ConnectedIntegration.user_id == user.id, ConnectedIntegration.provider == "google")
            .first()
        )
        if not integration:
            integration = ConnectedIntegration(
                user_id=user.id,
                provider="google",
                access_token=access_token,
                photos_enabled=True,
                contacts_enabled=True,
                scopes="openid email profile https://www.googleapis.com/auth/photoslibrary.readonly",
            )
            db.add(integration)
        else:
            integration.access_token = access_token
            integration.photos_enabled = True
        db.commit()

        return TokenResponse(
            access_token=create_access_token(user.id),
            user=UserResponse.model_validate(user),
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth exchange failed: {str(e)}")
