# ══════════════════════════════════════════════════════════════
# FILE: backend/app/routers/chat.py
# Week 5 — the 3 endpoints the frontend expects
# ══════════════════════════════════════════════════════════════

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models import User, ChatMessage
from app.schemas import ChatInput, ChatMessageResponse, ChatSendResponse
from app.services.chat_service import (
    CRISIS_REPLY, detect_crisis, generate_chat_reply,
)
from app.services.emotion_service import get_emotion_service

router = APIRouter(prefix="/chat", tags=["Chat 💬"])

CONTEXT_WINDOW = 10  # recent messages sent to Gemini as memory


@router.get("/history", response_model=list[ChatMessageResponse])
def get_chat_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    msgs = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.id.desc())
        .limit(limit)
        .all()
    )
    return list(reversed(msgs))  # oldest → newest for the chat UI


@router.post("", response_model=ChatSendResponse)
def send_chat(
    payload: ChatInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Full chat pipeline: emotion → crisis check → reply → store both sides."""
    # 1️⃣ Emotion AI
    result = get_emotion_service().analyze(payload.text)
    emotion = result["dominant_emotion"]

    # 2️⃣ Crisis safety net — always first, always deterministic
    crisis = detect_crisis(payload.text)

    # 3️⃣ Build the reply
    if crisis:
        reply_text = CRISIS_REPLY
    else:
        history = (
            db.query(ChatMessage)
            .filter(ChatMessage.user_id == current_user.id)
            .order_by(ChatMessage.id.desc())
            .limit(CONTEXT_WINDOW)
            .all()
        )
        history.reverse()
        reply_text = generate_chat_reply(payload.text, emotion, history)

    # 4️⃣ Store both sides
    user_msg = ChatMessage(user_id=current_user.id, role="user",
                           text=payload.text, emotion=emotion)
    bot_msg = ChatMessage(user_id=current_user.id, role="assistant",
                          text=reply_text, emotion=None)
    db.add(user_msg)
    db.add(bot_msg)
    db.commit()
    db.refresh(user_msg)
    db.refresh(bot_msg)

    return ChatSendResponse(
        user_message=ChatMessageResponse.model_validate(user_msg),
        reply=ChatMessageResponse.model_validate(bot_msg),
        crisis=crisis,
    )


@router.delete("/history", status_code=204)
def clear_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
    db.commit()