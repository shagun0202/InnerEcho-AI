"""
InnerEcho-AI Emotion Detection API

Wraps predict_emotion() from predict.py behind a FastAPI endpoint so the
frontend can call it over HTTP, and serves the frontend itself.

Run with:
    uvicorn main:app --reload
Then open:
    http://localhost:8000
"""

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from predict import predict_emotion

app = FastAPI(title="InnerEcho-AI Emotion Detection API")

# Allow the frontend to call this API whether it's served by FastAPI,
# opened directly as a file, or run through something like VS Code Live Server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextInput(BaseModel):
    text: str


@app.post("/predict")
def predict(input_data: TextInput):
    """Predict the emotion in a piece of text."""
    if not input_data.text or not input_data.text.strip():
        raise HTTPException(status_code=400, detail="text field cannot be empty")
    return predict_emotion(input_data.text)


@app.get("/health")
def health():
    return {"status": "ok"}


# Serve the Frontend folder at http://localhost:8000
FRONTEND_DIR = Path(__file__).resolve().parent / "Frontend"
app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
