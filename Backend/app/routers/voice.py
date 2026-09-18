import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.dependencies import get_current_user
from app.models import User
from app.services.tts_service import get_tts_service

router = APIRouter(prefix="/voice", tags=["Voice 🎙️"])

class TTSRequest(BaseModel):
    text: str
    language: str

@router.get("/status")
def get_voice_status():
    tts = get_tts_service()
    return {"available": tts.available, "provider": tts.provider}

@router.post("/tts")
def generate_tts(payload: TTSRequest, current_user: User = Depends(get_current_user)):
    tts = get_tts_service()
    if not tts.available:
        raise HTTPException(status_code=503, detail="TTS Provider not configured")
        
    audio_path = tts.generate_speech(payload.text, payload.language)
    if not audio_path:
        raise HTTPException(status_code=500, detail="Failed to generate audio")
        
    return FileResponse(audio_path, media_type="audio/mpeg")

@router.get("/meditation/{program_id}/{language}")
def get_meditation_audio(program_id: str, language: str, current_user: User = Depends(get_current_user)):
    # Simple placeholder logic: in a real implementation this would fetch/generate the full program
    # For now, we return 404 or a predefined mock file
    raise HTTPException(status_code=404, detail="Meditation audio generation not fully implemented")
