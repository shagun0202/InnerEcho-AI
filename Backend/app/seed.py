# ══════════════════════════════════════════════════════════════
# FILE: backend/app/seed.py
# 🆕 21 evidence-based wellness activities (auto-seeded at startup)
# ══════════════════════════════════════════════════════════════

from sqlalchemy.orm import Session

from app.models import Activity

ACTIVITIES = [
    # ── SADNESS ──
    {"emotion": "sadness", "type": "journaling", "title": "Small Wins List",
     "description": "Gently counter the sadness spiral by noticing what went okay.",
     "duration_minutes": 5,
     "content": "Write down 3 things that went even slightly okay today — however small. A warm coffee, a message from a friend, finishing a task. Sadness narrows our vision; this widens it again."},
    {"emotion": "sadness", "type": "nature", "title": "10-Minute Daylight Walk",
     "description": "Sunlight + movement is one of the most proven gentle mood lifters.",
     "duration_minutes": 10,
     "content": "Step outside for 10 minutes. No phone. Notice 5 things you can see, and let your face get some daylight. Even on grey days, outdoor light helps your brain chemistry."},
    {"emotion": "sadness", "type": "social", "title": "Reach Out to One Person",
     "description": "Sadness grows in isolation. One small connection breaks it.",
     "duration_minutes": 5,
     "content": "Message one person you trust — even just 'hey, thinking of you'. You don't have to explain your feelings. Connection itself is the medicine."},
    {"emotion": "sadness", "type": "music", "title": "Gentle Lift Playlist",
     "description": "Warm acoustic music can safely hold and lift a heavy mood.",
     "duration_minutes": 15,
     "content": "Search 'acoustic chill' or 'feel good indie' on your music app. Start with softer songs that match your mood, then let them gradually lift. Music that meets you where you are works better than forced cheerfulness."},

    # ── ANGER ──
    {"emotion": "anger", "type": "breathing", "title": "4-7-8 Breathing",
     "description": "The fastest physiological way to cool down anger.",
     "duration_minutes": 3,
     "content": "Inhale through your nose for 4 seconds → hold for 7 → exhale slowly through your mouth for 8. Repeat 4 rounds. The long exhale switches your body out of fight mode."},
    {"emotion": "anger", "type": "physical", "title": "Burn It Off",
     "description": "Anger is energy. Give it somewhere healthy to go.",
     "duration_minutes": 10,
     "content": "Do 10 minutes of brisk movement: fast walk, stairs, push-ups, dancing to one loud song. Physical discharge stops anger from looping in your head."},
    {"emotion": "anger", "type": "journaling", "title": "Write & Release",
     "description": "Say everything uncensored — then let it go.",
     "duration_minutes": 7,
     "content": "Write exactly what you're angry about, with zero filter. No one will ever read it. When you're done, delete it or tear the page up. The writing processes it; the destroying releases it."},
    {"emotion": "anger", "type": "mindfulness", "title": "Name It to Tame It",
     "description": "Labeling an emotion measurably reduces its intensity.",
     "duration_minutes": 2,
     "content": "Pause and say silently: 'I am feeling anger. My jaw/fists/chest feel tight.' Observe it like weather passing. Don't act for 90 seconds — that's how long the chemical surge lasts."},

    # ── FEAR / ANXIETY ──
    {"emotion": "fear", "type": "breathing", "title": "Box Breathing",
     "description": "Used by Navy SEALs to stay calm under pressure.",
     "duration_minutes": 4,
     "content": "Inhale 4s → hold 4s → exhale 4s → hold 4s. Trace a square in your mind. Repeat 5 rounds. The equal rhythm tells your nervous system: you're safe."},
    {"emotion": "fear", "type": "mindfulness", "title": "5-4-3-2-1 Grounding",
     "description": "Pulls your brain out of anxious thoughts and into the present.",
     "duration_minutes": 5,
     "content": "Name: 5 things you can SEE → 4 you can TOUCH → 3 you can HEAR → 2 you can SMELL → 1 you can TASTE. Anxiety lives in the future; your senses live now."},
    {"emotion": "fear", "type": "journaling", "title": "Worry → One Small Step",
     "description": "Turn vague anxiety into one concrete, controllable action.",
     "duration_minutes": 7,
     "content": "Write your worry in one sentence. Then answer: 'What is ONE tiny part of this I can actually control?' Write that step and when you'll do it. Anxiety shrinks when it becomes a plan."},
    {"emotion": "fear", "type": "meditation", "title": "5-Minute Body Scan",
     "description": "Release the physical tension anxiety hides in your body.",
     "duration_minutes": 5,
     "content": "Sit comfortably. Slowly move attention from your toes to your head, relaxing each part as you go. When your mind wanders to worries, gently return to the body. No judgment."},

    # ── JOY ──
    {"emotion": "joy", "type": "journaling", "title": "Savor It",
     "description": "Re-living a good moment in detail deepens its positive effect.",
     "duration_minutes": 5,
     "content": "Describe today's good moment in rich detail: where were you, what did you see/hear/feel, who was there? Savoring can genuinely amplify the wellbeing benefit of a positive experience."},
    {"emotion": "joy", "type": "social", "title": "Share the Joy",
     "description": "Shared joy is amplified joy — and it strengthens your bonds.",
     "duration_minutes": 3,
     "content": "Tell one person about your good moment today — a call, a text, in person. Notice how sharing it makes the feeling bigger, not smaller."},
    {"emotion": "joy", "type": "music", "title": "Celebrate & Move",
     "description": "Lock in the good mood with music and movement.",
     "duration_minutes": 10,
     "content": "Play 2-3 songs you love and actually move — dance, walk, stretch. Positive emotion stored in the body lasts longer than positive emotion only in the head."},

    # ── SURPRISE ──
    {"emotion": "surprise", "type": "journaling", "title": "Unpack the Unexpected",
     "description": "Process what the surprise actually means for you.",
     "duration_minutes": 5,
     "content": "Write: What exactly surprised me? Was it pleasant, unpleasant, or confusing? What does it change — if anything? Surprises settle once we understand them."},
    {"emotion": "surprise", "type": "mindfulness", "title": "Two-Minute Check-In",
     "description": "Let the dust settle before reacting.",
     "duration_minutes": 2,
     "content": "Sit still for 2 minutes. Notice: after the surprise fades, what emotion is underneath it — excitement, worry, curiosity? That's the feeling to listen to."},

    # ── DISGUST ──
    {"emotion": "disgust", "type": "journaling", "title": "Values Check",
     "description": "Disgust often signals a crossed boundary or violated value.",
     "duration_minutes": 6,
     "content": "Write: What exactly felt wrong? Which of my values did it violate — fairness, respect, honesty? Naming the value turns a bad feeling into useful self-knowledge."},
    {"emotion": "disgust", "type": "breathing", "title": "Reset Breath",
     "description": "Physically reset after something leaves a bad taste.",
     "duration_minutes": 3,
     "content": "Take 5 slow breaths, exhaling longer than you inhale. With each exhale, imagine releasing the residue of what you experienced. Then drink a glass of water — a small physical reset."},

    # ── NEUTRAL ──
    {"emotion": "neutral", "type": "journaling", "title": "The Color of Today",
     "description": "A playful prompt for days that feel like 'nothing much'.",
     "duration_minutes": 5,
     "content": "If today were a color, what would it be and why? What would have made it one shade brighter? Flat days often hide small feelings worth noticing."},
    {"emotion": "neutral", "type": "mindfulness", "title": "Two-Minute Stillness",
     "description": "A micro-meditation to tune into what's quietly present.",
     "duration_minutes": 2,
     "content": "Close your eyes for 2 minutes. Don't try to feel anything. Just notice what's already here — sounds, breath, any faint emotion. 'Neutral' often means 'not yet noticed'."},
    {"emotion": "neutral", "type": "nature", "title": "Step Outside",
     "description": "A tiny environment change to refresh a flat mood.",
     "duration_minutes": 5,
     "content": "Go outside or to a window for 5 minutes. Look at the furthest point you can see. Changing your visual field genuinely changes your mental field."},
    {"emotion": "neutral", "type": "game", "title": "A Five-Minute Mind Reset",
     "description": "A light, time-boxed puzzle can interrupt an unhelpful thought loop.",
     "duration_minutes": 5,
     "content": "Set a 5-minute timer and play one simple word, number, or visual puzzle. The goal is not to win or keep scrolling; it is to give your attention one small, satisfying reset. Stop when the timer ends and notice whether your body feels different."},
]


def seed_activities(db: Session):
    """Seed missing activities without overwriting users' existing history."""
    existing_titles = {title for (title,) in db.query(Activity.title).all()}
    inserted = 0
    for data in ACTIVITIES:
        if data["title"] not in existing_titles:
            db.add(Activity(**data))
            inserted += 1
    if inserted:
        db.commit()
        print(f"🌱 Seeded {inserted} new wellness activities")
