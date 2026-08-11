# ══════════════════════════════════════════════════════════════
# FILE: backend/app/services/gemini_service.py
# 🆕 Empathetic AI replies via Google Gemini (free tier)
# KEY DESIGN: always falls back to curated replies — never crashes.
# ══════════════════════════════════════════════════════════════

from google import genai

from app.config import GEMINI_API_KEY, GEMINI_MODEL

PROMPT_TEMPLATE = """You are MoodMentor, a warm and supportive emotional wellness companion.

A user wrote this journal entry:
\"\"\"{text}\"\"\"

Emotion analysis detected their dominant emotion as: {emotion} ({confidence:.0%} confidence).

Write a short reply (3-4 sentences) that:
- Validates their feelings with warmth and zero judgment
- Reflects something specific from what they wrote, so they feel truly heard
- Never diagnoses, never gives medical advice, never claims to be a therapist
- Ends with one gentle, hopeful suggestion or encouraging thought
- Sounds human and caring — not robotic, not clinical

Reply:"""

# Curated fallback replies — used if no API key / quota exceeded / offline.
# This is what makes the app DEMO-PROOF. 🛡️
FALLBACK_REPLIES = {
    "joy": "It's genuinely lovely to feel the happiness in your words — moments like this deserve to be noticed and savored. Thank you for recording it. Keep collecting these bright moments; they're fuel for the harder days. 💛",
    "sadness": "Thank you for trusting this space with something so honest. What you're feeling is real and valid, and you don't have to carry it alone. Be as gentle with yourself today as you would with a close friend — small steps still count. 💙",
    "anger": "Your anger makes sense — it's often a signal that something felt unfair or crossed a line. It takes real self-awareness to write it down instead of letting it explode. Give yourself a moment to cool before acting; you're handling this better than you think. 🧡",
    "fear": "It takes courage to put anxious thoughts into words. Remember: feelings of fear are not facts about the future. Take one slow, deep breath right now — you've handled hard moments before, and you can take this one step at a time. 💚",
    "surprise": "Life just threw something unexpected at you, and it's completely okay to take a moment to process it. Writing it down is a great way to make sense of it — clarity usually follows surprise. 💜",
    "disgust": "Something clearly didn't sit right with you, and that reaction is worth listening to — it often points to a value that matters deeply to you. Acknowledging it, like you're doing right now, is the healthy move. 🤎",
    "neutral": "Thanks for checking in with yourself today — even ordinary days deserve a moment of attention. Sometimes quiet days are exactly what we need. Is there one small thing that could add a spark to tomorrow? ✨",
}

# Keep curated offline replies warm and relevant when GoEmotions returns a
# nuanced label that is not one of the original seven catalog emotions.
FALLBACK_EMOTION_GROUP = {
    "annoyance": "anger", "disapproval": "anger", "nervousness": "fear",
    "grief": "sadness", "disappointment": "sadness", "embarrassment": "sadness",
    "remorse": "sadness", "amusement": "joy", "excitement": "joy",
    "love": "joy", "gratitude": "joy", "optimism": "joy", "pride": "joy",
    "relief": "joy", "admiration": "joy", "approval": "joy", "caring": "joy",
    "confusion": "surprise", "curiosity": "surprise", "realization": "surprise",
}


class GeminiService:
    def __init__(self):
        self.client = None
        if not GEMINI_API_KEY:
            print("ℹ️  No GEMINI_API_KEY — using fallback replies (app still works!)")
            return
        try:
            self.client = genai.Client(api_key=GEMINI_API_KEY)
            print("✅ Gemini connected")
        except Exception as e:
            print(f"⚠️  Gemini init failed ({e}) — using fallback replies")

    def generate_empathetic_reply(self, text: str, dominant_emotion: str,
                                  confidence: float) -> str:
        fallback_key = FALLBACK_EMOTION_GROUP.get(dominant_emotion, dominant_emotion)
        fallback = FALLBACK_REPLIES.get(fallback_key, FALLBACK_REPLIES["neutral"])
        if self.client is None:
            return fallback
        try:
            response = self.client.models.generate_content(
                model=GEMINI_MODEL,
                contents=PROMPT_TEMPLATE.format(
                    text=text, emotion=dominant_emotion, confidence=confidence
                ),
            )
            return response.text.strip()
        except Exception as e:
            print(f"⚠️  Gemini request failed ({e}) — using fallback reply")
            return fallback


_service: "GeminiService | None" = None


def get_gemini_service() -> GeminiService:
    global _service
    if _service is None:
        _service = GeminiService()
    return _service
