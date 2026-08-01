# 🧠 MoodMentor

![Status](https://img.shields.io/badge/status-in--development-yellow) ![Python](https://img.shields.io/badge/backend-FastAPI-009688) ![React](https://img.shields.io/badge/frontend-React-61DAFB)

> An AI-powered emotional wellness companion that doesn't just *detect* emotions — it genuinely helps people feel better, understand themselves, and build healthy coping habits. Built to be used by real users, not just demoed.

**Team:** 4 members · **Timeline:** 8 weeks · **Audience:** General users (free for everyone)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [AI/ML Design](#aiml-design)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Team & Roles](#team--roles)
- [8-Week Roadmap](#8-week-roadmap)
- [Privacy & Responsible AI](#privacy--responsible-ai)
- [Demo-Day Checklist](#demo-day-checklist)

---

## Overview

**Core flow:** User writes a journal entry → emotion model returns 7 emotions with confidence scores → Gemini writes an empathetic reply → recommendation engine suggests activities → everything is stored → dashboard turns history into insights over time.

---

## Features

### ✅ Core (must be flawless)
- User auth — signup/login, private journals
- Journaling — write daily reflections
- Emotion detection — 7 emotions (joy, sadness, anger, fear, surprise, disgust, neutral) with confidence scores
- AI empathetic response — warm, non-judgmental reply to every entry (Gemini)
- Wellness recommendations — breathing, meditation, music, prompts, activities matched to emotion
- Dashboard — mood trends over time, emotion distribution, interactive charts

### 🔥 Wow features (committed for 8 weeks)
- **Live Emotion Meter** — emotions update as you type (debounced API calls)
- **Mood Calendar Heatmap** — GitHub-style calendar, colored by daily mood
- **AI Companion Chat** — supportive chatbot that remembers recent mood history
- **Weekly AI Wellness Report** — Gemini-generated "Spotify Wrapped" for your emotions
- **Trigger Word Cloud** — which words/topics appear in stressed vs. happy entries
- **Crisis Detection** — severe distress → gentle message + real helplines (e.g., KIRAN 1800-599-0019, India)
- **Mood Pattern Insights** — e.g. "You tend to feel anxious on Sundays" (day-of-week pattern mining)
- **Gamification** — journaling streaks + wellness score

### 🚀 Stretch (only if ahead of schedule)
- Voice journaling (Web Speech API → text → same pipeline)
- Music therapy links (YouTube/Spotify embeds per mood)
- PWA install (works like a mobile app)

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend | FastAPI (Python) | Fast, auto-generated API docs |
| Frontend | React + Tailwind CSS | Industry-standard, polished UI |
| Emotion Model | [`j-hartmann/emotion-english-distilroberta-base`](https://huggingface.co/j-hartmann/emotion-english-distilroberta-base) | Free, pre-trained, runs on CPU, 7 emotions + scores |
| Generative AI | Google Gemini API (AI Studio key) | Free tier, strong at empathetic text |
| Database | SQLite (dev) → PostgreSQL via Supabase (prod) | Start simple, deploy free |
| Charts | Recharts | Clean, interactive dashboards |
| Auth | JWT tokens (FastAPI `python-jose`) | Standard, secure |
| Deployment | Vercel (frontend) + Render (backend) + Supabase (DB) | 100% free — real users can access it |

> **Backup plan:** if React feels heavy mid-project, rebuild the UI in Streamlit (pure Python) in ~2 days. Aim for React first.

---

## Architecture

```
┌────────────────────────────────────────────────┐
│  FRONTEND — React + Tailwind CSS                │
│  Journal • Live Emotion Meter • AI Chat         │
│  Dashboard • Heatmap • Weekly Reports           │
└──────────────────────┬───────────────────────────┘
                       ↓  REST API (JSON)
┌────────────────────────────────────────────────┐
│  BACKEND — Python FastAPI                       │
│  JWT Auth • API Routes • Business Logic         │
└──────────────────────┬───────────────────────────┘
                       ↓
┌────────────────────────────────────────────────┐
│  AI ENGINE (Python)                             │
│  ① Emotion Model — DistilRoBERTa (7 emotions)   │
│  ② Generative AI — Google Gemini (free tier)    │
│  ③ Recommendation Engine — hybrid rule+content  │
│  ④ Crisis Detector — safety layer               │
└──────────────────────┬───────────────────────────┘
                       ↓
┌────────────────────────────────────────────────┐
│  DATABASE — SQLite (dev) → PostgreSQL (prod)    │
│  users • journals • emotions • chats • moods    │
└────────────────────────────────────────────────┘
```

---

## AI/ML Design

**Emotion detection**
- Load the model once at server startup via `transformers.pipeline("text-classification", top_k=None)`
- Return all 7 emotions with scores; store the full JSON per entry
- Compute a **valence score** (positive − negative emotions) for trend charts
- Optional upgrade later: `SamLowe/roberta-base-go_emotions` (28 emotions)

**Generative AI (Gemini) — 3 uses**
1. **Empathetic reply** — prompt includes detected emotions + scores; rules: validate feelings, never diagnose, 3–4 sentences, end with a gentle suggestion
2. **Weekly report** — feed aggregated stats → narrative summary, wins, patterns, one actionable tip
3. **Chat companion** — system prompt: supportive wellness buddy + last 7 days of mood context

**Recommendation engine (hybrid)**
- Rule-based map: each dominant emotion → 3–5 curated activities (evidence-based: 4-7-8 breathing, CBT-style prompts, grounding techniques)
- Content-based layer: users rate recommendations 👍/👎 → future suggestions re-ranked
- Stored in an `activities` table so it's data-driven, not hardcoded

**Crisis detection**
- Trigger: high fear/sadness score (>0.85) **or** crisis keyword list
- Response: caring message + helpline numbers + "you're not alone" resources
- Always show disclaimer: *"MoodMentor supports wellness but is not a substitute for professional help."*

---

## Database Schema

```
users            → id, name, email, password_hash, created_at
journal_entries  → id, user_id, text, created_at
emotion_analysis → id, entry_id, emotions_json, dominant_emotion,
                   confidence, valence_score
recommendations  → id, entry_id, activity_type, content, rating
chat_messages    → id, user_id, role (user/ai), message, created_at
daily_moods      → id, user_id, date, avg_valence, dominant_emotion
gamification     → id, user_id, streak_days, wellness_score, last_entry_date
activities       → id, emotion, type, title, description, content_url
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Create a new account |
| POST | `/auth/login` | Log in, receive a JWT |
| POST | `/journal` | Analyze + store an entry → emotions, AI reply, recommendations |
| POST | `/journal/preview` | Live emotion meter (no storage) |
| GET | `/journal/history` | List past entries |
| GET | `/analytics/trends` | Mood trend data for charts |
| GET | `/analytics/heatmap` | Calendar heatmap data |
| GET | `/analytics/wordcloud` | Word cloud data |
| GET | `/analytics/insights` | Pattern-mining results |
| POST | `/chat` | AI companion, with mood context |
| GET | `/report/weekly` | Gemini-generated weekly report |
| POST | `/recommendations/{id}/rate` | 👍/👎 a recommendation |
| GET | `/gamification/stats` | Streaks and wellness score |

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A free [Google AI Studio](https://aistudio.google.com/) key for Gemini
- A free [Supabase](https://supabase.com/) project (optional, for prod DB)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000` (interactive docs at `/docs`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` (or whatever Vite prints).

### Environment variables

Create a `.env` in `backend/`:

```
GEMINI_API_KEY=your-key-here
JWT_SECRET=your-secret-here
DATABASE_URL=sqlite:///./moodmentor.db
```

---

## Team & Roles

| Member | Role | Owns |
|---|---|---|
| A | ML/AI Engineer | Emotion model, Gemini integration, recommendation engine, crisis detection |
| B | Backend Engineer | FastAPI, auth, database, all API endpoints |
| C | Frontend Engineer | React UI, dashboard, charts, heatmap, chat interface |
| D | Integration + DevOps | DB schema, connecting frontend↔backend, testing, deployment, docs |

**Weekly ritual:** 30-min team sync + merge code to `main` every Friday. GitHub from day 1.

---

## 8-Week Roadmap

| Week | Milestone |
|---|---|
| 1 | Repo setup, architecture, UI wireframes, emotion model running in a notebook (PoC) |
| 2 | Auth + journal CRUD + emotion analysis integrated end-to-end |
| 3 | Gemini empathetic replies + recommendation engine + DB finalized |
| 4 | Dashboard v1: trend charts, emotion distribution, heatmap |
| 5 | AI chat companion + live emotion meter |
| 6 | Weekly report + word cloud + pattern insights + gamification |
| 7 | Crisis detection, full testing, bug fixes, UI polish |
| 8 | Deployment (live URL), documentation, demo video, presentation prep |

---

## Privacy & Responsible AI

- Passwords hashed (bcrypt); journals are private per user
- Crisis resources always one click away
- Clear disclaimer: wellness support, **not** medical advice
- "Delete my data" option — users own their data
- No journal text sent anywhere except the Gemini call (disclosed in the privacy note)

---

## Demo-Day Checklist

- [ ] Live public URL anyone can try
- [ ] Type a sad entry → watch emotions, AI reply, and recommendations appear in under 3 seconds
- [ ] Show a dashboard with 2+ weeks of data and a weekly AI report
- [ ] Show crisis detection handling a distress message gracefully
- [ ] One slide: architecture + models used + responsible AI practices

---

## License

TBD
