# ══════════════════════════════════════════════════════════════
# FILE: backend/app/dependencies.py
# Reusable FastAPI dependencies: DB session + current user
# ══════════════════════════════════════════════════════════════

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import User
from app.services.auth_service import decode_token


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


_bearer = HTTPBearer()


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    """Validates the JWT and returns the logged-in User.
    Add `current_user: User = Depends(get_current_user)` to ANY
    endpoint to make it private."""
    user_id = decode_token(creds.credentials)
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

