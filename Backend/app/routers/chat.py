# ══════════════════════════════════════════════════════════════
# FILE: backend/app/routers/chat.py
# 🆕 NEW FILE — send message / history / clear
# ══════════════════════════════════════════════════════════════

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models import User, ChatMessage
from app.schemas import ChatInput, ChatResponse, ChatMessageResponse
from app.services.emotion_service import get_emotion_service
from app.services.chat_service import get_chat_service, CRISIS_REPLY

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse, status_code=201)
def send_message(
    payload: ChatInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Chat pipeline: emotion-tag the message → save → crisis check →
    mood-aware AI reply → save → return both."""
    # 1️⃣ Emotion AI tags the user's message
    result = get_emotion_service().analyze(payload.text)
    emotion = result["dominant_emotion"]

    # 2️⃣ Save the user's message
    user_msg = ChatMessage(user_id=current_user.id, role="user",
                           text=payload.text, emotion=emotion)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # 3️⃣ Crisis check FIRST — safety before everything 🚨
    chat = get_chat_service()
    crisis = chat.detect_crisis(payload.text)
    reply_text = (CRISIS_REPLY if crisis
                  else chat.generate_reply(db, current_user.id, payload.text, emotion))

    # 4️⃣ Save the assistant's reply
    bot_msg = ChatMessage(user_id=current_user.id, role="assistant", text=reply_text)
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)

    return ChatResponse(
        user_message=ChatMessageResponse.model_validate(user_msg),
        reply=ChatMessageResponse.model_validate(bot_msg),
        crisis=crisis,
    )


@router.get("/history", response_model=list[ChatMessageResponse])
def chat_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .limit(limit)
        .all()
    )


@router.delete("/history", status_code=204)
def clear_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
    db.commit()
