# ══════════════════════════════════════════════════════════════
# FILE: backend/app/services/recommender.py
# 🆕 Hybrid recommendation engine:
#    rule-based (emotion → activities) + user feedback re-ranking
# ══════════════════════════════════════════════════════════════

import random

from sqlalchemy.orm import Session

from app.models import Activity, Recommendation, JournalEntry


def get_recommendations(db: Session, user_id: int, emotions: dict,
                        limit: int = 3) -> list[Activity]:
    """Pick the best activities for the user's current emotional state."""
    sorted_emotions = sorted(emotions.items(), key=lambda x: x[1], reverse=True)
    top_emotions = [e for e, _ in sorted_emotions[:2]]  # dominant + runner-up

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

