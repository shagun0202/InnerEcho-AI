# ══════════════════════════════════════════════════════════════
# FILE: backend/test_emotion.py
# Quick sanity check — run with: python test_emotion.py
# ══════════════════════════════════════════════════════════════

from app.services.emotion_service import EmotionService

service = EmotionService()

samples = [
    "I got promoted today! I'm so happy and excited for what's next!",
    "I feel so alone lately. Nobody really understands me.",
    "The deadline is killing me, I can't sleep and my chest feels tight.",
    "I'm furious — my teammate took credit for my work again.",
    "Just a normal day, nothing special happened.",
]

for text in samples:
    result = service.analyze(text)
    print(f"\n📝 {text}")
    print(f"   ➜ Dominant: {result['dominant_emotion']} "
          f"({result['confidence']:.0%}) | Valence: {result['valence_score']}")
    top3 = list(result["emotions"].items())[:3]
    print("   ➜ Top 3:", ", ".join(f"{e} {s:.0%}" for e, s in top3))