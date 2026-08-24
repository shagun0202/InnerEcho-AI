from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from app.dependencies import get_db, get_current_user
from app.models import User, JournalEntry, EmotionAnalysis, UserAchievement, ChatMessage
from app.schemas import GamificationResponse, AchievementDefinition

router = APIRouter(prefix="/gamification", tags=["Gamification"])

# Badge definitions
BADGES = [
    {'id': 'first_bloom', 'name': 'First Bloom', 'icon': '🌱', 'description': 'Write your first reflection'},
    {'id': 'streak_7', 'name': '7-Day Streak', 'icon': '🔥', 'description': 'Journal 7 consecutive days'},
    {'id': 'streak_30', 'name': '30-Day Champion', 'icon': '⭐', 'description': 'Maintain a 30-day streak'},
    {'id': 'calm_seeker', 'name': 'Calm Seeker', 'icon': '🌊', 'description': 'Complete 5 breathing exercises'},
    {'id': 'emotion_explorer', 'name': 'Emotion Explorer', 'icon': '🎭', 'description': 'Experience 5+ different emotions'},
    {'id': 'mood_lifter', 'name': 'Mood Lifter', 'icon': '💪', 'description': 'Improve valence 3 days in a row'},
    {'id': 'chatty', 'name': 'Open Heart', 'icon': '💬', 'description': 'Have 10 companion conversations'},
    {'id': 'self_aware', 'name': 'Self Aware', 'icon': '🧠', 'description': 'Write 20 reflections'},
    {'id': 'gratitude_guru', 'name': 'Gratitude Guru', 'icon': '🙏', 'description': 'Write 5 gratitude entries'},
    {'id': 'studio_regular', 'name': 'Studio Regular', 'icon': '📸', 'description': 'Use Mood Studio 10 times'},
]

def _compute_streak(db, user_id):
    """Compute current journaling streak in days."""
    entries = db.query(JournalEntry.created_at).filter(
        JournalEntry.user_id == user_id
    ).order_by(JournalEntry.created_at.desc()).all()
    
    if not entries:
        return 0
    
    dates = sorted(set(e.created_at.date() for e in entries), reverse=True)
    today = datetime.now(timezone.utc).date()
    
    if dates[0] < today - timedelta(days=1):
        return 0
    
    streak = 1
    for i in range(1, len(dates)):
        if dates[i-1] - dates[i] == timedelta(days=1):
            streak += 1
        else:
            break
    return streak

def _check_badges(db, user_id, streak, total_entries):
    """Check which badges the user has earned and unlock new ones."""
    existing = {a.badge_id for a in db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()}
    
    earned = set()
    
    # First Bloom
    if total_entries >= 1:
        earned.add('first_bloom')
    # 7-day streak
    if streak >= 7:
        earned.add('streak_7')
    # 30-day streak
    if streak >= 30:
        earned.add('streak_30')
    # Self aware (20 entries)
    if total_entries >= 20:
        earned.add('self_aware')
    # Emotion explorer (5+ unique emotions)
    unique_emotions = db.query(EmotionAnalysis.dominant_emotion).join(JournalEntry).filter(
        JournalEntry.user_id == user_id
    ).distinct().count()
    if unique_emotions >= 5:
        earned.add('emotion_explorer')
    # Open heart (10 chat messages)
    chat_count = db.query(ChatMessage).filter(
        ChatMessage.user_id == user_id, ChatMessage.role == 'user'
    ).count()
    if chat_count >= 10:
        earned.add('chatty')
    
    # Unlock new badges
    new_badges = earned - existing
    for badge_id in new_badges:
        db.add(UserAchievement(user_id=user_id, badge_id=badge_id))
    if new_badges:
        db.commit()
    
    return earned


@router.get("/stats", response_model=GamificationResponse)
def get_gamification_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get gamification stats: streak, wellness score, badges."""
    total_entries = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).count()
    streak = _compute_streak(db, current_user.id)
    earned = _check_badges(db, current_user.id, streak, total_entries)
    
    # Wellness score (0-100): based on streak, consistency, and entry count
    wellness_score = min(100, streak * 5 + min(total_entries * 2, 50))
    
    # Build badge list with unlock status
    unlocked_map = {}
    for a in db.query(UserAchievement).filter(UserAchievement.user_id == current_user.id).all():
        unlocked_map[a.badge_id] = a.unlocked_at
    
    badges = []
    for b in BADGES:
        badges.append(AchievementDefinition(
            id=b['id'], name=b['name'], icon=b['icon'], description=b['description'],
            unlocked=b['id'] in earned,
            unlocked_at=unlocked_map.get(b['id'])
        ))
    
    return GamificationResponse(
        streak_days=streak, total_entries=total_entries,
        wellness_score=wellness_score, badges=badges
    )
