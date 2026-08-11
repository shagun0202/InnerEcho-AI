# ══════════════════════════════════════════════════════════════
# FILE: backend/app/services/recommender.py
# 🆕 Hybrid recommendation engine:
#    rule-based (emotion → activities) + user feedback re-ranking
# ══════════════════════════════════════════════════════════════

import random

from sqlalchemy.orm import Session

from app.models import Activity, Recommendation, JournalEntry


# GoEmotions is intentionally precise; the wellness catalog is organised into
# a smaller set of intervention categories. This mapping keeps every label
# actionable while still allowing the UI to show the original detailed label.
EMOTION_TO_ACTIVITY_CATEGORY = {
    "anger": "anger", "annoyance": "anger", "disapproval": "anger",
    "disgust": "disgust", "fear": "fear", "nervousness": "fear",
    "sadness": "sadness", "grief": "sadness", "disappointment": "sadness",
    "embarrassment": "sadness", "remorse": "sadness",
    "joy": "joy", "amusement": "joy", "excitement": "joy", "love": "joy",
    "gratitude": "joy", "optimism": "joy", "pride": "joy", "relief": "joy",
    "admiration": "joy", "approval": "joy", "caring": "joy",
    "surprise": "surprise", "realization": "surprise", "confusion": "surprise",
    "curiosity": "surprise", "desire": "surprise", "neutral": "neutral",
}


def get_recommendations(db: Session, user_id: int, emotions: dict,
                        limit: int = 3) -> list[Activity]:
    """Pick the best activities for the user's current emotional state."""
    sorted_emotions = sorted(emotions.items(), key=lambda x: x[1], reverse=True)
    top_emotions = [
        EMOTION_TO_ACTIVITY_CATEGORY.get(emotion, "neutral")
        for emotion, _ in sorted_emotions[:3]
    ]
    # Preserve order while avoiding duplicate categories, e.g. grief + sadness.
    top_emotions = list(dict.fromkeys(top_emotions))

    candidates = db.query(Activity).filter(Activity.emotion.in_(top_emotions)).all()

    # 📈 Learning layer: boost activity TYPES the user has rated 👍 before
    past_rated = (
        db.query(Recommendation)
        .join(JournalEntry, Recommendation.entry_id == JournalEntry.id)
        .filter(JournalEntry.user_id == user_id, Recommendation.rating.isnot(None))
        .all()
    )
    affinity: dict[str, int] = {}
    for rec in past_rated:
        t = rec.activity.type
        affinity[t] = affinity.get(t, 0) + rec.rating

    def score(activity: Activity) -> int:
        base = 2 if activity.emotion == top_emotions[0] else 1
        return base + affinity.get(activity.type, 0)

    random.shuffle(candidates)               # variety among equal scores
    candidates.sort(key=score, reverse=True)  # best first
    return candidates[:limit]

