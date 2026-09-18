# ══════════════════════════════════════════════════════════════
# FILE: backend/app/services/places_service.py
# Real-data Places integration with graceful fallback
# ══════════════════════════════════════════════════════════════

"""Nearby places recommendations backed by Google Places API (New) when
configured, falling back to structured Google Maps search URLs otherwise.

All place data returned comes from a live API or pre-built search links.
No fabricated names, ratings, or distances.
"""

import logging
import os
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

# Mood → place type & keyword mappings for discovery
MOOD_PLACE_QUERIES = {
    "sadness": [
        {"type": "park", "keyword": "quiet park", "label": "A calm green space"},
        {"type": "cafe", "keyword": "cozy cafe", "label": "A quiet corner to sit"},
    ],
    "joy": [
        {"type": "park", "keyword": "park playground", "label": "An open space to enjoy"},
        {"type": "cafe", "keyword": "cheerful cafe", "label": "Somewhere bright to be"},
    ],
    "anger": [
        {"type": "park", "keyword": "nature walk", "label": "A walk to clear your head"},
        {"type": "gym", "keyword": "gym fitness", "label": "Move the energy out"},
    ],
    "fear": [
        {"type": "cafe", "keyword": "cozy quiet cafe", "label": "Somewhere familiar and safe"},
        {"type": "park", "keyword": "garden", "label": "A gentle, open place"},
    ],
    "neutral": [
        {"type": "park", "keyword": "park", "label": "A change of scenery"},
        {"type": "cafe", "keyword": "cafe", "label": "A seat by the window"},
    ],
}


def _maps_search_url(keyword: str, place_type: str) -> str:
    """Build a Google Maps search URL (works without API key)."""
    import urllib.parse

    query = urllib.parse.quote_plus(f"{keyword} near me")
    return f"https://www.google.com/maps/search/{query}"


def _get_mood_key(emotion: str) -> str:
    """Map detailed emotions to broad mood categories."""
    mapping = {
        "admiration": "joy",
        "amusement": "joy",
        "approval": "joy",
        "caring": "joy",
        "excitement": "joy",
        "gratitude": "joy",
        "joy": "joy",
        "love": "joy",
        "optimism": "joy",
        "pride": "joy",
        "relief": "joy",
        "anger": "anger",
        "annoyance": "anger",
        "disapproval": "anger",
        "disgust": "anger",
        "disappointment": "sadness",
        "grief": "sadness",
        "remorse": "sadness",
        "sadness": "sadness",
        "confusion": "fear",
        "embarrassment": "fear",
        "fear": "fear",
        "nervousness": "fear",
    }
    return mapping.get(emotion, "neutral")


async def get_nearby_places(
    emotion: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius: int = 2000,
) -> list[dict]:
    """Return nearby place suggestions based on mood.

    When GOOGLE_MAPS_API_KEY is set and coordinates are provided,
    queries Places API (New) for real results. Otherwise, returns
    structured Google Maps search URLs.
    """
    mood = _get_mood_key(emotion)
    queries = MOOD_PLACE_QUERIES.get(mood, MOOD_PLACE_QUERIES["neutral"])
    results = []

    if GOOGLE_MAPS_API_KEY and latitude and longitude:
        # Live Places API (New) text search
        async with httpx.AsyncClient(timeout=8) as client:
            for q in queries[:2]:
                try:
                    resp = await client.post(
                        "https://places.googleapis.com/v1/places:searchText",
                        headers={
                            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
                            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.googleMapsUri,places.currentOpeningHours",
                        },
                        json={
                            "textQuery": q["keyword"],
                            "locationBias": {
                                "circle": {
                                    "center": {
                                        "latitude": latitude,
                                        "longitude": longitude,
                                    },
                                    "radius": radius,
                                }
                            },
                            "maxResultCount": 3,
                        },
                    )
                    if resp.status_code == 200:
                        places = resp.json().get("places", [])
                        for p in places[:2]:
                            name = p.get("displayName", {}).get("text", "")
                            results.append(
                                {
                                    "type": "outdoor",
                                    "title": name,
                                    "description": q["label"],
                                    "address": p.get("formattedAddress", ""),
                                    "rating": p.get("rating"),
                                    "open_now": (
                                        p.get("currentOpeningHours", {}).get(
                                            "openNow"
                                        )
                                    ),
                                    "url": p.get("googleMapsUri", ""),
                                    "icon": "pin",
                                    "source": "google_places",
                                }
                            )
                except Exception:
                    logger.warning("places_api_error keyword=%s", q["keyword"])
    else:
        # Fallback: Google Maps search URLs (no API key needed)
        for q in queries[:2]:
            results.append(
                {
                    "type": "outdoor",
                    "title": q["label"],
                    "description": f"Search for a {q['keyword']} near you",
                    "url": _maps_search_url(q["keyword"], q["type"]),
                    "icon": "pin",
                    "source": "maps_search",
                }
            )

    return results


def get_nearby_places_sync(emotion: str, **kwargs) -> list[dict]:
    """Synchronous wrapper for use in non-async FastAPI endpoints."""
    import asyncio

    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        # Already in async context — run in a new thread
        import concurrent.futures

        with concurrent.futures.ThreadPoolExecutor() as pool:
            return pool.submit(
                asyncio.run, get_nearby_places(emotion, **kwargs)
            ).result()
    else:
        return asyncio.run(get_nearby_places(emotion, **kwargs))
