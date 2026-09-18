# ══════════════════════════════════════════════════════════════
# FILE: backend/app/routers/chat.py
# RAG-enhanced companion chat with source citations
# ══════════════════════════════════════════════════════════════

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models import User, ChatMessage
from app.schemas import (
    ChatInput,
    ChatMessageResponse,
    ChatSendResponse,
    RAGSource,
)
from app.services.chat_service import (
    CRISIS_REPLY,
    detect_crisis,
    generate_chat_reply,
)
from app.services.emotion_service import get_emotion_service, EmotionService
from app.services.wellness_service import coordinate, plan_response, get_profile
from app.services.safety_service import assess_safety
from app.wellness_schemas import CheckinInput

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat 💬"])

CONTEXT_WINDOW = 10  # recent messages sent to Gemini as memory


def _try_rag_reply(text, emotion, history, profile, db, user_id):
    """Attempt RAG-augmented reply. Returns (reply_text, sources, used_personal) or None on failure."""
    try:
        from app.services.rag_service import get_rag_service
        from app.services.personal_context_service import get_personal_context_service

        rag = get_rag_service()
        pcs = get_personal_context_service()

        # Retrieve relevant knowledge chunks
        retrieved = rag.retrieve(db, text, top_k=3)

        # Retrieve personal context if consented
        personal_context = pcs.retrieve_relevant_context(
            db, user_id, text, ai_consent=profile.ai_consent, top_k=3
        )

        # Generate RAG-augmented response
        result = rag.generate_rag_response(
            text=text,
            emotion=emotion,
            history=history,
            retrieved_chunks=retrieved,
            personal_context=personal_context,
            ai_allowed=profile.ai_consent,
        )

        sources = [
            RAGSource(
                title=s.get("document_title", ""),
                url=s.get("source_url"),
                source_name=s.get("source_name"),
                relevance_score=s.get("relevance_score"),
                chunk_id=s.get("chunk_id"),
            )
            for s in result.get("sources", [])
        ]

        return result["reply"], sources, result.get("used_personal_context", False)
    except Exception:
        logger.warning("rag_pipeline_fallback")
        return None


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
    """Full chat pipeline: safety → emotion → RAG retrieval → reply → store."""
    profile = get_profile(db, current_user.id)

    # 1️⃣ Safety first — always deterministic, before any AI
    safety_result = assess_safety(payload.text)
    crisis = safety_result["risk_level"] in {"high", "critical"}
    result = (
        EmotionService.local_analysis(payload.text)
        if crisis
        else get_emotion_service().analyze(payload.text)
    )
    emotion = result["dominant_emotion"]

    # 2️⃣ Crisis safety net
    crisis = crisis or detect_crisis(payload.text)

    sources = []
    used_personal_context = False

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

        # Try RAG-augmented reply first
        rag_result = _try_rag_reply(
            payload.text, emotion, history, profile, db, current_user.id
        )

        if rag_result:
            reply_text, sources, used_personal_context = rag_result
        else:
            # Fallback to direct Gemini / curated reply
            reply_text = generate_chat_reply(
                payload.text,
                emotion,
                history,
                ai_allowed=profile.ai_consent,
            )

    # 4️⃣ Store both sides
    user_msg = ChatMessage(
        user_id=current_user.id, role="user", text=payload.text, emotion=emotion
    )
    bot_msg = ChatMessage(
        user_id=current_user.id, role="assistant", text=reply_text, emotion=None
    )
    db.add(user_msg)
    db.add(bot_msg)
    db.flush()
    db.refresh(user_msg)
    db.refresh(bot_msg)

    # 5️⃣ Store RAG citations if any
    if sources:
        try:
            from app.models_rag import RAGCitation

            for src in sources:
                if src.chunk_id:
                    db.add(
                        RAGCitation(
                            message_id=bot_msg.id,
                            chunk_id=src.chunk_id,
                            relevance_score=src.relevance_score,
                        )
                    )
        except Exception:
            logger.warning("rag_citation_store_fallback")

    plan = coordinate(
        db,
        current_user.id,
        CheckinInput(
            text=payload.text, source="chat", mood=None, energy=None, stress=None
        ),
        analysis=result,
    )
    db.commit()
    return ChatSendResponse(
        user_message=ChatMessageResponse.model_validate(user_msg),
        reply=ChatMessageResponse.model_validate(bot_msg),
        crisis=crisis,
        wellness_plan=plan_response(plan),
        sources=sources,
        used_personal_context=used_personal_context,
    )


@router.delete("/history", status_code=204)
def clear_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
    db.commit()


@router.delete("/personal-context", status_code=204)
def clear_personal_context(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete the user's personal context index (not their actual journal/chat data)."""
    try:
        from app.services.personal_context_service import get_personal_context_service

        get_personal_context_service().delete_user_context(db, current_user.id)
        db.commit()
    except Exception:
        logger.warning("personal_context_delete_fallback")
        raise HTTPException(500, "Could not clear personal context")


@router.get("/sources/{message_id}", response_model=list[RAGSource])
def get_message_sources(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve knowledge-base citations for a specific AI reply."""
    # Verify message belongs to this user
    msg = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.id == message_id,
            ChatMessage.user_id == current_user.id,
            ChatMessage.role == "assistant",
        )
        .first()
    )
    if not msg:
        raise HTTPException(404, "Message not found")

    try:
        from app.models_rag import RAGCitation, KnowledgeChunk, KnowledgeDocument

        citations = (
            db.query(RAGCitation, KnowledgeChunk, KnowledgeDocument)
            .join(KnowledgeChunk, RAGCitation.chunk_id == KnowledgeChunk.id)
            .join(
                KnowledgeDocument,
                KnowledgeChunk.document_id == KnowledgeDocument.id,
            )
            .filter(RAGCitation.message_id == message_id)
            .all()
        )
        return [
            RAGSource(
                title=doc.title,
                url=doc.source_url,
                source_name=doc.source_name,
                relevance_score=cit.relevance_score,
                chunk_id=cit.chunk_id,
            )
            for cit, chunk, doc in citations
        ]
    except Exception:
        return []
