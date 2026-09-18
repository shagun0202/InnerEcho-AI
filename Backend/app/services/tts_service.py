import os
import hashlib
import logging
from pathlib import Path
from typing import Optional

from app.config import GOOGLE_TTS_API_KEY

AUDIO_CACHE_DIR = Path(__file__).resolve().parents[2] / "audio_cache"

class TTSService:
    def __init__(self):
        self.available = bool(GOOGLE_TTS_API_KEY)
        self.provider = "google" if self.available else "none"
        if not AUDIO_CACHE_DIR.exists():
            AUDIO_CACHE_DIR.mkdir(parents=True, exist_ok=True)
            
        if self.available:
            try:
                from google.cloud import texttospeech
                self.client = texttospeech.TextToSpeechClient(
                    client_options={"api_key": GOOGLE_TTS_API_KEY}
                )
                logging.getLogger(__name__).info("Google TTS Configured")
            except Exception as e:
                logging.getLogger(__name__).warning("Failed to initialize Google TTS: %s", e)
                self.available = False
                self.provider = "none"

    def generate_speech(self, text: str, language: str) -> Optional[Path]:
        if not self.available:
            return None
            
        # Select voice based on language
        voice_map = {
            "en": "en-US-Neural2-F",
            "hi": "hi-IN-Neural2-A",
            "mr": "mr-IN-Standard-B", 
            "ml": "ml-IN-Standard-B",
            "ta": "ta-IN-Standard-A"
        }
        
        voice_name = voice_map.get(language, "en-US-Neural2-F")
        lang_code = "-".join(voice_name.split("-")[:2])
        
        # Cache file
        text_hash = hashlib.md5(f"{language}_{text}".encode()).hexdigest()
        cache_file = AUDIO_CACHE_DIR / f"{text_hash}.mp3"
        
        if cache_file.exists():
            return cache_file
            
        try:
            from google.cloud import texttospeech
            
            synthesis_input = texttospeech.SynthesisInput(text=text)
            voice = texttospeech.VoiceSelectionParams(
                language_code=lang_code,
                name=voice_name
            )
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3
            )
            
            response = self.client.synthesize_speech(
                input=synthesis_input, voice=voice, audio_config=audio_config
            )
            
            with open(cache_file, "wb") as out:
                out.write(response.audio_content)
                
            return cache_file
        except Exception as e:
            logging.getLogger(__name__).error("TTS Generation Error: %s", e)
            return None


_service: "TTSService | None" = None

def get_tts_service() -> TTSService:
    global _service
    if _service is None:
        _service = TTSService()
    return _service
