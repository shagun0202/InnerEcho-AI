# ══════════════════════════════════════════════════════════════
# FILE: backend/app/services/safety_service.py
# 🛡️ Privacy-First Multi-Tier Safety Assessment Engine
# Categorizes risk signals with clear explanations and action tiers.
# ══════════════════════════════════════════════════════════════

from typing import Dict, Any, List

CRISIS_RESOURCES = [
    {
        "name": "KIRAN National Mental Health Helpline (India)",
        "number": "1800-599-0019",
        "description": "24/7 free, confidential psychological support in 13 languages.",
        "type": "helpline",
    },
    {
        "name": "Tele-MANAS",
        "number": "14416",
        "description": "Government of India 24/7 mental health helpline.",
        "type": "helpline",
    },
    {
        "name": "National Emergency Services",
        "number": "112",
        "description": "Immediate police, medical, and emergency dispatch.",
        "type": "emergency",
    },
    {
        "name": "Vandrevala Foundation",
        "number": "+91 9999 666 555",
        "description": "Free 24/7 crisis counselling via phone and WhatsApp.",
        "type": "helpline",
    },
]

# High-risk & critical indicators
CRITICAL_PATTERNS = [
    "kill myself", "suicide", "suicidal", "end my life", "end it all",
    "want to die", "wanna die", "hang myself", "take my own life",
    "cut my wrist", "overdose", "slit my", "better off dead",
]

HIGH_PATTERNS = [
    "self harm", "self-harm", "selfharm", "hurt myself", "hurting myself",
    "cut myself", "cutting myself", "no reason to live", "don't want to live",
    "dont want to live", "better off without me", "can't go on anymore",
    "cant go on anymore", "wish i was dead", "wish i was never born",
]

MODERATE_PATTERNS = [
    "completely hopeless", "everything is falling apart", "i am worthless",
    "nobody cares about me", "can't take this anymore", "cant take this anymore",
    "deeply overwhelmed", "cannot breathe from panic", "unbearable pain",
    "nothing matters anymore", "giving up on everything",
]

LOW_PATTERNS = [
    "feeling low", "rough day", "exhausted", "tired of everything",
    "burnt out", "stressed out", "sad today", "lonely", "disappointed",
]


class SafetyAssessment:
    def __init__(
        self,
        risk_level: str,
        score: float,
        action_required: bool,
        explanation: str,
        guidance: str,
        resources: List[Dict[str, str]],
    ):
        self.risk_level = risk_level  # 'none', 'low', 'moderate', 'high', 'critical'
        self.score = score
        self.action_required = action_required
        self.explanation = explanation
        self.guidance = guidance
        self.resources = resources

    def to_dict(self) -> Dict[str, Any]:
        return {
            "risk_level": self.risk_level,
            "score": self.score,
            "action_required": self.action_required,
            "explanation": self.explanation,
            "guidance": self.guidance,
            "resources": self.resources,
        }


def assess_safety(text: str) -> Dict[str, Any]:
    """
    Conservative, deterministic multi-tier risk detection.
    Frames signals as wellness risk signals rather than medical diagnosis.
    """
    t = text.lower().strip()
    if not t:
        return SafetyAssessment(
            risk_level="none",
            score=0.0,
            action_required=False,
            explanation="No text provided.",
            guidance="",
            resources=[],
        ).to_dict()

    # Tier 1: CRITICAL
    if any(p in t for p in CRITICAL_PATTERNS):
        return SafetyAssessment(
            risk_level="critical",
            score=1.0,
            action_required=True,
            explanation="Detected explicit critical distress indicators requiring immediate support.",
            guidance="Please connect immediately with crisis support services or someone you trust. Your safety is what matters most right now.",
            resources=CRISIS_RESOURCES,
        ).to_dict()

    # Tier 2: HIGH
    if any(p in t for p in HIGH_PATTERNS):
        return SafetyAssessment(
            risk_level="high",
            score=0.8,
            action_required=True,
            explanation="Detected potential self-harm or high distress language.",
            guidance="You are carrying something heavy. Reaching out to a professional or a trusted friend can provide safe ground.",
            resources=CRISIS_RESOURCES,
        ).to_dict()

    # Tier 3: MODERATE
    if any(p in t for p in MODERATE_PATTERNS):
        return SafetyAssessment(
            risk_level="moderate",
            score=0.5,
            action_required=False,
            explanation="Detected significant emotional overwhelm or feelings of hopelessness.",
            guidance="When things feel overwhelming, slowing down and speaking to someone you trust can help create clarity.",
            resources=CRISIS_RESOURCES[:2],
        ).to_dict()

    # Tier 4: LOW
    if any(p in t for p in LOW_PATTERNS):
        return SafetyAssessment(
            risk_level="low",
            score=0.2,
            action_required=False,
            explanation="Detected mild distress or everyday fatigue.",
            guidance="Take a mindful breath and allow yourself a quiet moment of rest.",
            resources=[],
        ).to_dict()

    # Tier 5: NONE
    return SafetyAssessment(
        risk_level="none",
        score=0.0,
        action_required=False,
        explanation="No safety risk signals detected.",
        guidance="",
        resources=[],
    ).to_dict()
