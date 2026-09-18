# ══════════════════════════════════════════════════════════════
# FILE: backend/app/services/emotion_service.py
# 🧠 Emotion detection using a pre-trained transformer model
# Model: SamLowe/roberta-base-go_emotions (GoEmotions)
# Detects 27 nuanced emotions plus neutral. Scores are multi-label rather
# than a seven-way probability distribution, so several feelings may score
# highly for the same journal entry.
# ══════════════════════════════════════════════════════════════

import logging
import re
from app.config import EMOTION_BACKEND

# Valence formula weights (tunable later based on testing)
POSITIVE_EMOTIONS = {
    "admiration": 0.7,
    "amusement": 0.7,
    "approval": 0.5,
    "caring": 0.7,
    "excitement": 0.8,
    "gratitude": 1.0,
    "joy": 1.0,
    "love": 1.0,
    "optimism": 0.8,
    "pride": 0.8,
    "relief": 0.7,
}
NEGATIVE_EMOTIONS = {
    "anger": 1.0,
    "annoyance": 0.6,
    "disappointment": 0.8,
    "disapproval": 0.5,
    "disgust": 0.8,
    "embarrassment": 0.7,
    "fear": 1.0,
    "grief": 1.0,
    "nervousness": 0.9,
    "remorse": 0.7,
    "sadness": 1.0,
}


class EmotionService:
    def __init__(self):
        self.classifier = None
        if EMOTION_BACKEND == "transformer":
            try:
                from transformers import pipeline

                self.classifier = pipeline(
                    task="text-classification",
                    model="SamLowe/roberta-base-go_emotions",
                    top_k=None,
                )
            except Exception:
                logging.getLogger(__name__).warning(
                    "emotion_model_unavailable; using local keyword signals"
                )

    def analyze(self, text: str) -> dict:
        """Analyze text and return all emotion scores + derived metrics."""
        if self.classifier is None:
            return self.local_analysis(text)
        try:
            results = self.classifier(text, truncation=True, max_length=512)[0]
        except Exception:
            logging.getLogger(__name__).warning(
                "emotion_inference_failed; using local keyword signals"
            )
            return self.local_analysis(text)

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
            "analysis_method": "goemotions",
        }

    @staticmethod
    def local_analysis(text):
        words = set(re.findall(r"[a-z]+", text.lower()))
        lexicon = {
            "joy": {"happy", "grateful", "excited", "joy", "proud"},
            "sadness": {"sad", "lonely", "alone", "drained", "exhausted"},
            "fear": {
                "anxious",
                "worried",
                "overwhelmed",
                "stress",
                "stressed",
                "afraid",
            },
            "anger": {"angry", "furious", "annoyed", "frustrated"},
        }
        counts = {k: len(v & words) for k, v in lexicon.items()}
        dominant = max(counts, key=counts.get) if any(counts.values()) else "neutral"
        # Keyword weights are not calibrated probabilities. The UI names the method.
        emotions = {dominant: 0.5 if dominant != "neutral" else 0.0}
        return dict(
            emotions=emotions,
            dominant_emotion=dominant,
            confidence=0.0,
            valence_score=(
                0.3 if dominant == "joy" else -0.3 if dominant != "neutral" else 0.0
            ),
            analysis_method="local_keywords",
        )

    # --- Singleton accessor (so the model loads ONCE and is shared) ---


_service: "EmotionService | None" = None


def get_emotion_service() -> "EmotionService":
    global _service
    if _service is None:
        _service = EmotionService()
    return _service
