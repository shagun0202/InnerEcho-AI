# ══════════════════════════════════════════════════════════════
# FILE: backend/seed_demo_data.py
# 🆕 NEW FILE — creates 45 days of realistic history for demos
# Run ONCE with:  python seed_demo_data.py
# Login after:  demo@moodmentor.ai  /  demo123
# ══════════════════════════════════════════════════════════════

import random
from datetime import datetime, timedelta

from app.database import SessionLocal
from app.models import User, JournalEntry, EmotionAnalysis
from app.services.auth_service import hash_password
from app.services.emotion_service import get_emotion_service

random.seed(7)

TEXTS = {
    "joy": [
        "Got praised by my mentor today, feeling so happy and motivated!",
        "Amazing day with my friends, we laughed so much. I love days like this.",
        "Finally finished my project module — so proud of myself!",
        "Woke up feeling grateful and excited for what's ahead.",
    ],
    "sadness": [
        "Feeling really low today, missing home a lot. Everything feels heavy.",
        "I feel alone lately, like nobody really understands me.",
        "Had a fight with my best friend and I can't stop thinking about it.",
    ],
    "fear": [
        "So anxious about the upcoming presentation, my heart races thinking about it.",
        "Can't sleep, keep worrying about deadlines and whether I'm good enough.",
        "Stressed about exams, there's too much to cover and I'm overwhelmed.",
    ],
    "anger": [
        "I'm furious — my teammate took credit for my work again.",
        "So frustrated with the traffic and the rude customer service today.",
        "It feels unfair how much pressure is put on me compared to others.",
    ],
    "neutral": [
        "Just a normal day, nothing special. Did my tasks and relaxed.",
        "Quiet evening, watched a movie and had dinner. Ordinary but okay.",
    ],
}

WEIGHTS = {"joy": 0.30, "sadness": 0.15, "fear": 0.25, "anger": 0.10, "neutral": 0.20}


def main():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "demo@moodmentor.ai").first()
        if user is None:
            user = User(name="Demo User", email="demo@moodmentor.ai",
                        password_hash=hash_password("demo123"))
            db.add(user)
            db.commit()
            db.refresh(user)
            print("👤 Created demo user")
        else:
            # wipe old demo entries so re-running stays clean
            for e in list(user.entries):
                db.delete(e)
            db.commit()
            print("👤 Demo user exists — refreshing entries")

        service = get_emotion_service()  # uses the REAL AI model!
        moods = list(WEIGHTS)
        weights = list(WEIGHTS.values())
        created = 0

        for days_ago in range(45, 0, -1):
            if random.random() < 0.22:
                continue  # skip some days — real users have gaps
            mood = random.choices(moods, weights=weights)[0]
            text = random.choice(TEXTS[mood])
            result = service.analyze(text)

            entry = JournalEntry(
                user_id=user.id, text=text,
                created_at=datetime.utcnow() - timedelta(days=days_ago),
            )
            entry.analysis = EmotionAnalysis(
                emotions_json=result["emotions"],
                dominant_emotion=result["dominant_emotion"],
                confidence=result["confidence"],
                valence_score=result["valence_score"],
            )
            db.add(entry)
            created += 1

        db.commit()
        print(f"✅ Seeded {created} entries over 45 days")
        print("🔑 Login: demo@moodmentor.ai  /  demo123")
    finally:
        db.close()


if __name__ == "__main__":
    main()