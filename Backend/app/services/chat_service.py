# ══════════════════════════════════════════════════════════════
# FILE: backend/app/services/chat_service.py
# 🆕 NEW FILE — mood-aware chat companion with crisis safety
# KEY DESIGN: reuses the Gemini singleton from gemini_service,
# reads the user's journal moods as context, never crashes.
# ══════════════════════════════════════════════════════════════

import random

from sqlalchemy.orm import Session

from app.config import GEMINI_MODEL
from app.models import JournalEntry, ChatMessage
from app.services.gemini_service import get_gemini_service

# 🚨 Crisis signals — checked BEFORE anything else (responsible AI)
CRISIS_KEYWORDS = [
    "suicide", "suicidal", "kill myself", "end my life", "want to die",
    "wanna die", "self harm", "self-harm", "hurt myself", "cutting myself",
    "no reason to live", "better off dead", "end it all", "can't go on anymore",
]

CRISIS_REPLY = (
    "I'm really glad you told me this, and I want you to know that your life matters. 💙\n\n"
    "What you're feeling right now is more than I can help with — but there are people "
    "trained for exactly this moment, and they truly want to listen:\n\n"
    "📞 KIRAN (Govt. of India): 1800-599-0019 — free, 24/7\n"
    "📞 AASRA: 9820466726 — 24/7\n"
    "📞 Vandrevala Foundation: 1860-2662-345 — 24/7\n\n"
    "If you're outside India, please search 'crisis helpline' + your country name.\n"
    "You don't have to carry this alone — please reach out right now. 🤝"
)

CHAT_PROMPT = """You are MoodMentor, a warm and supportive emotional wellness companion in a chat conversation.

USER'S RECENT JOURNAL MOODS (your memory of them):
{mood_context}

RECENT CONVERSATION:
{history}

RULES:
- Be warm, human, conversational — a caring friend, NOT a therapist, NOT a robot
- Keep replies SHORT: 2-4 sentences (this is chat, not an essay)
- Gently reference their emotional patterns when relevant ("I noticed you've been stressed lately...")
- Never diagnose, never give medical advice, never claim to be a professional
- Ask ONE gentle follow-up question when it helps them open up
- Their current message was detected as carrying the emotion: {emotion}

User's message: \"\"\"{text}\"\"\"

Your reply:"""

# Demo-proof fallbacks 🛡️ (no API key / quota / offline → chat still works)
FALLBACK_CHAT = [
    "I'm here and I'm listening. 💚 Tell me more about what's on your mind?",
    "Thank you for sharing that with me. How long have you been feeling this way?",
    "That sounds really significant. What feels like the heaviest part of it right now?",
    "I hear you — and whatever you're feeling is valid. What would help you feel even 1% better today?",
    "I'm glad you're putting this into words. That's already a strong step. What else is going on?",
]


class ChatService:
    @staticmethod
    def detect_crisis(text: str) -> bool:
        t = text.lower()
        return any(k in t for k in CRISIS_KEYWORDS)

    def _mood_context(self, db: Session, user_id: int) -> str:
        """The companion's 'memory': last 5 journal entries + their emotions."""
        entries = (
            db.query(JournalEntry)
            .filter(JournalEntry.user_id == user_id)
            .order_by(JournalEntry.created_at.desc())
            .limit(5)
            .all()
        )
        if not entries:
            return "No journal entries yet — you don't know much about them yet."
        lines = []
        for e in entries:
            day = e.created_at.strftime("%b %d")
            lines.append(
                f"- {day}: felt {e.analysis.dominant_emotion} "
                f"(valence {e.analysis.valence_score:+.2f}) — wrote: \"{e.text[:80]}\""
            )
        return "\n".join(lines)

    def _history(self, db: Session, user_id: int, limit: int = 10) -> str:
        msgs = (
            db.query(ChatMessage)
            .filter(ChatMessage.user_id == user_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
            .all()
        )
        msgs.reverse()  # oldest → newest
        if not msgs:
            return "(This is the start of the conversation)"
        return "\n".join(
            f"{'User' if m.role == 'user' else 'MoodMentor'}: {m.text}" for m in msgs
        )

    def generate_reply(self, db: Session, user_id: int, text: str, emotion: str) -> str:
        gemini = get_gemini_service()          # ♻️ reuse the existing singleton
        if gemini.client is None:
            return random.choice(FALLBACK_CHAT)
        try:
            prompt = CHAT_PROMPT.format(
                mood_context=self._mood_context(db, user_id),
                history=self._history(db, user_id),
                emotion=emotion,
                text=text,
            )
            response = gemini.client.models.generate_content(
                model=GEMINI_MODEL, contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            print(f"⚠️  Chat request failed ({e}) — using fallback reply")
            return random.choice(FALLBACK_CHAT)


_service: "ChatService | None" = None


def get_chat_service() -> ChatService:
    global _service
    if _service is None:
        _service = ChatService()
    return _service
