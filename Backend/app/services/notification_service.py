# ══════════════════════════════════════════════════════════════
# FILE: backend/app/services/notification_service.py
# 🚨 Minimalist, Privacy-Preserving Emergency Notification Service
# Strictly sends generic check-in notifications without private data.
# ══════════════════════════════════════════════════════════════

import logging
from typing import Optional, Dict, Any

logger = logging.getLogger("moodmentor.notifications")


class NotificationService:
    @staticmethod
    def send_trusted_contact_alert(
        user_name: str,
        contact_name: str,
        contact_phone: str,
        contact_email: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Dispatches a privacy-preserving safety notice.
        IMPORTANT: Never exposes user's journal text, emotion scores, or chat logs.
        """
        message_body = (
            f"MoodMentor Safety Notice: {user_name} may need some emotional support right now. "
            f"As their designated trusted contact, please consider reaching out to check on them "
            f"and make sure they are safe. 💚"
        )

        logger.info(
            f"📢 [EMERGENCY NOTIFICATION DISPATCH] To: {contact_name} ({contact_phone}) for User: {user_name}"
        )
        logger.info(f"📄 Message content: '{message_body}'")

        # In production, integrates with approved SMS/WhatsApp Business API (e.g. Twilio)
        # In local/demo mode, returns successful delivery confirmation
        return {
            "delivered": True,
            "recipient_name": contact_name,
            "recipient_phone": contact_phone,
            "recipient_email": contact_email,
            "message_summary": "Minimal privacy-preserving check-in notice dispatched.",
            "provider": "simulated_local_gateway",
        }
