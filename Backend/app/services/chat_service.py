# ══════════════════════════════════════════════════════════════
# FILE: backend/app/services/chat_service.py
# 🆕 NEW FILE — mood-aware chat companion with crisis safety
# KEY DESIGN: reuses the Gemini singleton from gemini_service,
# reads the user's journal moods as context, never crashes.
# ══════════════════════════════════════════════════════════════

import random

from app.config import GEMINI_MODEL
from app.models import ChatMessage
from app.services.gemini_service import get_gemini_service

# ── 🚨 Crisis safety net — deterministic code, NEVER the LLM's job ──
CRISIS_KEYWORDS = [
    "suicide", "suicidal", "kill myself", "end my life", "end it all",
    "want to die", "wanna die", "self harm", "self-harm", "selfharm",
    "hurt myself", "hurting myself", "cut myself", "cutting myself",
    "no reason to live", "don't want to live", "dont want to live",
    "better off dead", "better off without me", "can't go on", "cant go on",
]

CRISIS_REPLY = (
    "I'm really glad you told me this, and I want you to know: your life matters, "
    "and what you're carrying sounds heavier than anyone should carry alone. 💚\n\n"
    "Please reach out right now — you can call KIRAN, India's free 24/7 mental "
    "health helpline, at 1800-599-0019. If you're in immediate danger, call 112.\n\n"
    "And if you can, tell someone you trust today — a friend, family member, "
    "teacher, or counselor. You deserve support, and help is truly available. 🤝"
)


def detect_crisis(text: str) -> bool:
    """Keyword safety net. Deliberately errs on the side of caution:
    a false alarm costs one caring message; a miss costs everything."""
    t = text.lower()
    return any(keyword in t for keyword in CRISIS_KEYWORDS)


# ── 💬 Gemini reply with conversation memory ──
CHAT_PROMPT = """You are MoodMentor, a warm and supportive emotional wellness companion.

Rules for every reply:
- 2-4 sentences, warm and human — never robotic or clinical
- Validate the feeling FIRST, then ask at most ONE gentle follow-up question
- Remember details from the conversation and refer back to them naturally
- Never diagnose, never give medical advice, never claim to be a therapist
- If the person seems to be struggling seriously, gently encourage reaching
  out to someone they trust or a professional

{history}The user's latest message (detected emotion: {emotion}):
\"\"\"{text}\"\"\"

Your reply:"""


def _format_history(messages: list[ChatMessage]) -> str:
    """Render recent messages as a transcript for the prompt."""
    if not messages:
        return ""
    lines = ["Recent conversation:"]
    for m in messages:
        speaker = "User" if m.role == "user" else "MoodMentor"
        lines.append(f"{speaker}: {m.text}")
    return "\n".join(lines) + "\n\n"


# ── 🛡️ Curated fallbacks — demo-proofing, same philosophy as Week 3 ──
# Two variants per emotion so repeated chats don't look broken.
FALLBACK_CHAT = {
    "joy": [
        "That's wonderful to hear! 😊 Moments like this deserve to be savored — what's been the best part of it?",
        "I can feel the happiness in your words! 💛 What's making today feel so good?",
    ],
    "sadness": [
        "I'm really glad you're sharing this with me. 💙 That sounds heavy — what's weighing on you the most right now?",
        "Thank you for trusting me with this feeling. You don't have to carry it alone — I'm listening. What's on your heart?",
    ],
    "anger": [
        "That frustration makes sense — something clearly felt unfair. 🧡 I'm here; want to tell me what happened?",
        "It takes real self-awareness to talk about anger instead of acting on it. What triggered this feeling?",
    ],
    "fear": [
        "That sounds genuinely stressful, and it's okay to feel this way. 💚 What's the biggest worry looping in your mind right now?",
        "I'm right here with you. Sometimes naming a fear out loud shrinks it a little — what scenario are you imagining?",
    ],
    "surprise": [
        "That sounds unexpected! 💜 How are you feeling about it now that the first shock is settling?",
        "Life just threw you a curveball! Was it the good kind of surprise or the tricky kind?",
    ],
    "disgust": [
        "Something about that clearly didn't sit right with you — and that reaction is worth listening to. What felt wrong about it?",
        "That sounds really off-putting. This feeling often points to a value of yours being crossed — does that ring true?",
    ],
    "neutral": [
        "Thanks for checking in with me. ✨ How has your day been treating you so far?",
        "I'm here and listening 💚 What's been on your mind today?",
    ],
}


def _fallback_reply(emotion: str) -> str:
    return random.choice(FALLBACK_CHAT.get(emotion, FALLBACK_CHAT["neutral"]))


def generate_chat_reply(text: str, emotion: str,
                        history: list[ChatMessage]) -> str:
    """Gemini reply with trimmed conversation context.
    Reuses the Week 3 singleton client — auto-fallback if unavailable."""
    service = get_gemini_service()
    if service.client is None:
        return _fallback_reply(emotion)
    try:
        prompt = CHAT_PROMPT.format(
            history=_format_history(history), emotion=emotion, text=text
        )
        response = service.client.models.generate_content(
            model=GEMINI_MODEL, contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"⚠️  Gemini chat failed ({e}) — using fallback reply")
        return _fallback_reply(emotion)