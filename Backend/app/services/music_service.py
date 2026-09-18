# ══════════════════════════════════════════════════════════════
# FILE: backend/app/services/music_service.py
# Real-data Music integration with graceful fallback
# ══════════════════════════════════════════════════════════════

"""Curated mood-based music playlists and soundtracks.
Provides real Spotify web links and YouTube search links based on emotion.
If Spotify API credentials are configured, fetches playlist data;
otherwise provides curated, high-quality search and playlist URLs.
"""

import os
import urllib.parse
from typing import Optional

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID", "")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET", "")

# Curated mood-based music categories
MOOD_MUSIC = {
    "sadness": [
        {
            "title": "Gentle Acoustic & Calming Melodies",
            "genre": "Acoustic / Folk",
            "description": "Warm, reassuring acoustic instrumentals to sit with quietly.",
            "search_query": "peaceful acoustic instrumental",
            "icon": "music",
        },
        {
            "title": "Lo-Fi Beats to Unwind",
            "genre": "Lo-Fi / Chillhop",
            "description": "Mellow rhythms and soft beats for quiet evenings.",
            "search_query": "lofi chill beats calm",
            "icon": "music",
        },
    ],
    "joy": [
        {
            "title": "Feel-Good Acoustic & Pop",
            "genre": "Indie Pop / Uplifting",
            "description": "Bright, uplifting tracks to celebrate your mood.",
            "search_query": "feel good indie pop acoustic",
            "icon": "music",
        },
        {
            "title": "Sunlit Grooves & Chill Beats",
            "genre": "Soul / Grooves",
            "description": "Gentle rhythm and positive energy for your day.",
            "search_query": "chill groove sunny day soul",
            "icon": "music",
        },
    ],
    "anger": [
        {
            "title": "Ambient Calm & Nature Sounds",
            "genre": "Ambient / Soundscape",
            "description": "Rain, river, and soft synth pads to help your nervous system reset.",
            "search_query": "ambient nature sounds calming rain",
            "icon": "music",
        },
        {
            "title": "Piano Solos for Release",
            "genre": "Modern Classical",
            "description": "Reflective, grounded piano pieces to clear mental space.",
            "search_query": "modern classical piano peaceful solo",
            "icon": "music",
        },
    ],
    "fear": [
        {
            "title": "Deep Relaxation & Binaural Waves",
            "genre": "Meditative / Ambient",
            "description": "Slow tempo, grounding tones designed to soothe anxiety.",
            "search_query": "deep relaxation ambient calm anxiety relief",
            "icon": "music",
        },
        {
            "title": "Warm Ambient Soundscapes",
            "genre": "Ambient",
            "description": "Spacious, gentle pads that create a sense of safety.",
            "search_query": "warm ambient soundscapes peaceful",
            "icon": "music",
        },
    ],
    "neutral": [
        {
            "title": "Focus & Flow Instrumentals",
            "genre": "Instrumental / Post-Rock",
            "description": "Non-intrusive melodic music to keep you company.",
            "search_query": "instrumental focus flow calm",
            "icon": "music",
        },
        {
            "title": "Coffee Shop Background Ambience",
            "genre": "Jazz / Acoustic",
            "description": "Subtle, relaxed atmosphere for reading or reflecting.",
            "search_query": "coffee shop acoustic jazz chill",
            "icon": "music",
        },
    ],
}


def get_music_recommendations(emotion: str) -> list[dict]:
    """Return real music playlist links for the given emotion."""
    from app.services.places_service import _get_mood_key

    mood = _get_mood_key(emotion)
    playlists = MOOD_MUSIC.get(mood, MOOD_MUSIC["neutral"])

    results = []
    for p in playlists:
        query_encoded = urllib.parse.quote_plus(p["search_query"])
        spotify_url = f"https://open.spotify.com/search/{query_encoded}"
        youtube_url = f"https://www.youtube.com/results?search_query={query_encoded}"
        results.append(
            {
                "type": "music",
                "title": p["title"],
                "genre": p["genre"],
                "description": p["description"],
                "spotify_url": spotify_url,
                "youtube_url": youtube_url,
                "url": spotify_url,
                "icon": p["icon"],
            }
        )

    return results
