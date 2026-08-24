# MoodMentor

MoodMentor is an AI-powered employee wellness platform. It gives employees a private space to reflect, understand emotional patterns, access practical wellness activities, and participate in optional team-wellbeing features.

> MoodMentor supports wellbeing. It is not a diagnostic, medical, or emergency service.

## What is implemented

- Secure signup and login with bcrypt password hashing and JWT authentication
- Private journals with emotion analysis, valence scoring, AI responses, and personalised activity recommendations
- GoEmotions analysis using `SamLowe/roberta-base-go_emotions` (27 nuanced emotions plus neutral)
- Gemini-powered supportive journal replies, companion chat, and weekly reports, with safe fallback text when Gemini is unavailable
- Mood dashboard: streak, trend, mood distribution, and daily valence chart
- Recommendation ratings that influence later activity suggestions
- Crisis-keyword safety response in companion chat
- Mood Studio with local-only camera filters, breathing reset, and local snapshot saving
- Quick private mood check-ins
- Guided meditation, ambient sound player, mood playlist, and meeting-recovery timer
- Gamification: wellness score, streaks, and badges
- Weekly wellness report and work-life balance score
- Optional team mood board and kudos wall
- Landing page, onboarding, dark mode, responsive React interface

## Architecture

```text
React + Vite frontend
        |
        | JSON API + JWT
        v
FastAPI backend
  ├─ emotion analysis (GoEmotions)
  ├─ Gemini wellness responses
  ├─ recommendations and analytics
  ├─ team wellbeing features
  └─ SQLite database (development)
```

## Technology

| Area | Technology |
|---|---|
| Frontend | React, Vite, Recharts, custom CSS |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | SQLite for development; PostgreSQL-ready configuration |
| Authentication | JWT and bcrypt |
| Emotion model | `SamLowe/roberta-base-go_emotions` |
| Generative AI | Google Gemini, default `gemini-2.5-flash` |

## Run locally

### Backend

```powershell
cd "Backend"
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`. Open `http://127.0.0.1:8000/docs` for API documentation.

Create `Backend/.env` for non-default settings:

```env
SECRET_KEY=replace-with-a-long-random-secret
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash
DATABASE_URL=sqlite:///./moodmentor.db
```

`GEMINI_API_KEY` is optional: the app uses curated fallback replies if it is unavailable.

### Frontend

Open another terminal:

```powershell
cd "Frontend\moodmentor-web"
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

To use a non-default API URL, create `Frontend/moodmentor-web/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Main API groups

| Prefix | Purpose |
|---|---|
| `/auth` | signup, login, current user |
| `/journal` | create, retrieve, and delete reflections |
| `/analytics` | dashboard summaries, trends, and distribution |
| `/chat` | companion chat and chat history |
| `/recommendations` | rate recommended activities |
| `/mood` | quick private mood check-ins |
| `/gamification` | badges, score, and streaks |
| `/report` | weekly wellness report |
| `/team` | anonymous team mood, kudos, meeting recovery, work-life balance |

## Privacy notes

- Journal entries, chat history, and quick mood check-ins are private to the signed-in user.
- Team mood submissions aggregate the mood and optional note; the team summary does not display employee identity.
- Mood Studio uses browser camera permission. Video stays in the browser and snapshots download locally; the backend does not upload or analyse camera images.
- Never commit `Backend/.env`, database files, `node_modules`, or production secrets. They are ignored by `.gitignore`.

## Project folders

```text
Backend/app/                 FastAPI application, routes, models, services
Frontend/moodmentor-web/     Current React application
Frontend/frontend.html       Earlier standalone HTML prototype
```
