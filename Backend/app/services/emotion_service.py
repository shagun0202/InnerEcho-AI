# ══════════════════════════════════════════════════════════════
# FILE: backend/app/services/emotion_service.py
# 🧠 Emotion detection using a pre-trained transformer model
# Model: j-hartmann/emotion-english-distilroberta-base
# Detects 7 emotions: anger, disgust, fear, joy, neutral, sadness, surprise
# ══════════════════════════════════════════════════════════════

from transformers import pipeline

# Valence formula weights (tunable later based on testing)
POSITIVE_EMOTIONS = {"joy": 1.0, "surprise": 0.5}
NEGATIVE_EMOTIONS = {"sadness": 1.0, "anger": 1.0, "fear": 1.0, "disgust": 1.0}


class EmotionService:
    def __init__(self):
        print("⏳ Loading emotion model (first run downloads ~330MB, one time only)...")
        self.classifier = pipeline(
            task="text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None,  # return confidence scores for ALL 7 emotions
        )
        print("✅ Emotion model loaded successfully!")

    def analyze(self, text: str) -> dict:
        """Analyze text and return all emotion scores + derived metrics."""
        results = self.classifier(text)[0]  # list of {"label": str, "score": float}

        # Build sorted emotion dict: {"joy": 0.97, "surprise": 0.02, ...}
        emotions = {r["label"]: round(r["score"], 4) for r in results}
        emotions = dict(sorted(emotions.items(), key=lambda x: x[1], reverse=True))

        dominant = next(iter(emotions))
        confidence = emotions[dominant]

        # Valence score: overall positivity, range -1 (very negative) to +1 (very positive)
        positive = sum(emotions.get(e, 0) * w for e, w in POSITIVE_EMOTIONS.items())
        negative = sum(emotions.get(e, 0) * w for e, w in NEGATIVE_EMOTIONS.items())
        valence = round(max(-1.0, min(1.0, positive - negative)), 4)

        return {
            "emotions": emotions,
            "dominant_emotion": dominant,
            "confidence": confidence,
            "valence_score": valence,
        }
    # --- Singleton accessor (so the model loads ONCE and is shared) ---
_service: "EmotionService | None" = None


def get_emotion_service() -> "EmotionService":
    global _service
    if _service is None:
        _service = EmotionService()
    return _service
