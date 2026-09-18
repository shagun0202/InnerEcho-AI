# InnerEcho-AI
An AI-powered emotional wellness platform that uses NLP and Machine Learning to analyze user emotions from text, provide personalized wellness recommendations, and help users track their emotional well-being.
# MoodMentor

**Agentic AI Employee Wellness Management**

MoodMentor turns a private check-in into a practical next step: understand the moment, suggest an activity, let the employee act, measure the outcome, and adapt future suggestions. It is a wellness tool, not a medical diagnostic system or emergency service.

## What works

- Companion-first workspace with a collapsible sidebar, contextual recommendation panel, and an original editorial design using warm cream, plum, pastel accents, and garden/lake imagery. Light/dark themes and responsive mobile navigation.
- Email/password signup and login; optional verified Google sign-in and explicit account linking.
- Server-backed onboarding, goals, preferred activity types/duration, workday hours, timezone, favorites, optional in-app reminders, and AI-sharing preference.
- AI Wellness Command Center and Mood Rescue, with a persistent decision trace and Start / Change / Not now controls.
- Private reflections and companion conversation in one chronological interface, both connected to actual wellness plans. A tool tray opens meditation, check-ins, music searches, map searches, a trusted contact, Mood Lens, and the activity library.
- Microphone dictation with editable transcripts, optional spoken replies, and English/Marathi/Hindi/Malayalam/Tamil input choices. Meditation includes matching-voice discovery, preview/replay, language, pace, and separate voice volume. Browser and installed voice support are required; missing language voices are clearly reported.
- Fourteen curated activities covering meditation, breathing, grounding, movement, walking, music, focus, connection, journaling, breaks, and an attention game.
- Two-, three-, five-, ten-, fifteen-, and twenty-minute sessions; immersive player, pause, resume, progress persistence, optional generated ambient sound and browser voice guidance.
- Before/after mood measurement and helpfulness feedback. Completed sessions inform later recommendations.
- Searchable private history, mood trends, activity effectiveness, local-date streaks, weekly intentions and milestones.
- Explicit team membership, invitation codes, named kudos, opt-in mood aggregation, and an optional shared check-in campaign. Aggregates require at least five distinct participants.
- Human-support resources, trusted-contact storage, and truthful unavailable notification delivery.
- Retained Mood Studio camera effects, loaded on demand. Frames remain in the browser. Model/WASM assets are fetched from their providers only when the feature is used.

The Companion starts with an empty personal history. No fake analytics, customers, achievements, or simulated delivery populate the product. The landing-page conversation is explicitly labeled as an example.

See [the Companion refresh release notes](docs/COMPANION_REFRESH.md) for the current frontend scope, original visual assets, verification, and remaining integrations.

The follow-up [voice and visual moments release](docs/VOICE_AND_VISUALS.md) adds three original music/café/outdoor images and browser speech controls. It documents the difference between browser narration and the professionally recorded five-language audio still planned.

## Architecture

```text
React + Vite + Tailwind / shared CSS tokens
    |  JSON API + short-lived bearer token
FastAPI routers -> wellness coordinator -> curated activities
    |                    |                    |
SQLAlchemy          Safety/context       Sessions + outcomes
    |               rules + optional          |
SQLite / PostgreSQL     AI             Personalization loop
```

The agents are understandable service responsibilities inside one backend, not microservices. Safety and state transitions are deterministic. Optional GoEmotions supplies emotion signals; Gemini can add contextual interpretation and language only with user consent. The learning layer reranks activities using actual before/after feedback, with a small-sample prior.

See [architecture and security trade-offs](docs/ARCHITECTURE.md) and [engineering report](docs/ENGINEERING_REPORT.md).

## Requirements

- Python **3.11 or newer**, preferably 3.12. The original default Python 3.9 is incompatible with this code.
- Node.js **22.12 or newer**.
- pnpm **11.19.0** (`npm install -g pnpm@11.19.0`). The pnpm lockfile is authoritative. `Backend/requirements-lock.txt` records the tested Python 3.12 dependency set; `requirements.txt` declares supported ranges.
- Optional: a Google Cloud OAuth client; a Gemini API key; local disk/network capacity for the GoEmotions model.

## Local setup

Run commands from the folder containing this README, `Backend`, and `Frontend` (the downloaded archive contains an extra outer directory).

### Backend

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r Backend/requirements-lock.txt
Copy-Item Backend/.env.example Backend/.env
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Paste the generated value into `SECRET_KEY` in `Backend/.env`. Do not commit that file. Without it, local development uses a random process-lifetime key and existing sessions expire when the API restarts.

```powershell
cd Backend
python -m uvicorn app.main:app --reload
```

API: [localhost:8000](http://127.0.0.1:8000), [interactive docs](http://127.0.0.1:8000/docs), [health](http://127.0.0.1:8000/health).

Startup creates tables and seeds only the activity catalog. The additive legacy migration includes Google identity and team columns; it never deletes journal data. Back up an existing database before migration. Legacy unscoped team submissions remain excluded from all new team workspaces.

### Frontend

In another terminal:

```powershell
cd Frontend/moodmentor-web
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:5173](http://localhost:5173). Copy `.env.example` to `.env` only to use a different API URL. There are no frontend secrets.

### Optional AI

Core workflows run with local keyword signals and curated guidance. The UI names the signal method rather than treating keyword weights as calibrated confidence.

To enable the local GoEmotions model:

```powershell
python -m pip install -r Backend/requirements-ai.txt
```

Set `EMOTION_BACKEND=transformer`. The first analysis downloads `SamLowe/roberta-base-go_emotions`; allow time and disk space. Inference failures fall back to local signals. Set `GEMINI_API_KEY` and optionally `GEMINI_MODEL` for contextual language. Each user must also enable Gemini sharing on their Profile. No text is sent merely because the operator configured a key.

### Google sign-in

1. Create a **Web application** OAuth client in Google Cloud and configure its consent screen/test users.
2. Add the exact redirect URI `http://localhost:5173/auth/google/callback` (use the same hostname in the browser).
3. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in `Backend/.env`; restart the API.
4. Choose Continue with Google. A matching local email requires password sign-in followed by explicit linking in Settings.

The flow uses state, PKCE, nonce, server-side code exchange, verified ID-token audience/issuer, and replay protection. Google Photos and Contacts are intentionally unavailable until a narrow, independently consented integration is built. Identity access never implies consent to private Google data.

See [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2/web-server) and [OpenID Connect validation](https://developers.google.com/identity/openid-connect/openid-connect).

## Configuration

| Variable | Default / purpose |
| --- | --- |
| `ENVIRONMENT` | `development`; production requires a strong configured secret |
| `SECRET_KEY` | No production default; at least 32 random characters |
| `DATABASE_URL` | `sqlite:///./moodmentor.db`, relative to backend working directory |
| `FRONTEND_URL` | `http://localhost:5173` |
| `CORS_ORIGINS` | Explicit localhost/127.0.0.1 frontend origins; wildcard rejected |
| `EMOTION_BACKEND` | `local` or `transformer` |
| `GEMINI_API_KEY` | Optional, backend only |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `GOOGLE_CLIENT_ID` | Optional OAuth web client ID |
| `GOOGLE_CLIENT_SECRET` | Optional, backend only |
| `GOOGLE_REDIRECT_URI` | Exact frontend OAuth callback |
| `TEAM_MIN_SAMPLE` | At least 5 distinct participants; lower settings clamp to 5 |
| `VITE_API_URL` | Frontend only: API base URL |
| `TEST_BASE_URL` | Browser tests: frontend URL, defaults to localhost:5173 |

## Start on this prepared Windows workspace

Dependencies are already installed for this workspace. These helpers find the prepared Python environment and the available Node runtime without requiring changes to your global PATH. Run each in a separate PowerShell terminal from the repository folder:

```powershell
.\scripts\start-backend.ps1
```

```powershell
.\scripts\start-frontend.ps1
```

Stop an already-running preview on the same ports before starting another copy. On a different computer, complete Local setup first.

## Tests and build

```powershell
# Active Python environment, from repository root
cd Backend
python -m pytest -q -p no:cacheprovider

# Frontend
cd ../Frontend/moodmentor-web
pnpm build
pnpm format:check
```

Browser tests require a running local API/frontend and Microsoft Edge. They create real QA accounts and complete one real two-minute intervention. Run them against a separate database, not a production account:

```powershell
# Backend terminal (activate Python environment first)
$env:DATABASE_URL = 'sqlite:///./qa-browser.db'
python -m uvicorn app.main:app --port 8001

# Frontend terminal
$env:VITE_API_URL = 'http://127.0.0.1:8001'
pnpm build
pnpm preview --host 127.0.0.1 --port 5173

# Test terminal, in Frontend/moodmentor-web
$env:TEST_BASE_URL = 'http://127.0.0.1:5173'
pnpm test:e2e
```

For Chromium instead of Edge, change the Playwright `channel` setting and install the required browser using Playwright. Unit tests isolate SQLite in memory and substitute Google provider responses to test nonce, state, PKCE, replay, and account-linking behavior. They do not pretend a real Google account was authorized.

## Main API groups

| Group | Function |
| --- | --- |
| `/auth`, `/auth/google` | Email auth, Google code flow, current user |
| `/wellness/profile` | Preferences, consent, favorites |
| `/wellness/checkins`, `/wellness/plans` | Coordinator, alternatives, dismissal |
| `/wellness/catalog`, `/wellness/sessions`, `/wellness/summary` | Activities, progress, outcomes, learning, analytics |
| `/journal` | Private reflection creation/history/deletion |
| `/chat` | Private companion messages/history/deletion |
| `/analytics`, `/report`, `/gamification` | Existing journal analytics, weekly reflection, badges |
| `/team` | Membership, aggregate moods, kudos, campaign, recovery guidance |
| `/safety` | Support checks, trusted contacts, honest delivery status |
| `/integrations` | Identity connection status and safe unlinking |

## Production considerations and limitations

This is a substantially improved, testable product foundation. It is **not a claim of completed enterprise certification or production deployment**.

- Use HTTPS, reviewed deployment configuration, an appropriate CSP, encrypted storage/backups, access controls for operators, retention/deletion policy, and operational monitoring.
- JWTs are one-hour bearer sessions in session storage. HttpOnly cookies with CSRF defense, refresh-token rotation, session revocation, email verification/recovery, MFA, and enterprise SSO are future work.
- The request limiter is per process/IP; use a shared reverse-proxy/gateway policy for multiple instances. Session timing is user-reported and wall-time bounded, not proof of active participation.
- PostgreSQL compatibility is considered in the models/migration, but production PostgreSQL must be integration-tested. Install `psycopg[binary]` and use a `postgresql+psycopg://...` connection string. Multi-instance migrations need dedicated deployment coordination.
- SQLite legacy databases with stricter historical constraints may need a reviewed migration; no destructive table rebuild is performed automatically.
- Keyword safety checks are not clinically validated and may produce false positives/negatives. Contextual clinical review, multilingual safety coverage, and specialist review remain necessary for broader use.
- External trusted-contact delivery, automatic notifications, push/email reminders, Photos, and Contacts access are unavailable. The UI never claims otherwise. In-app reminders are preference-gated and appear when the application is open.
- Browser speech depends on installed voices and browser implementation. Ambient audio is generated noise, not licensed nature recordings. Camera effects rely on external model/WASM asset availability.
- Team aggregates reduce exposure but cannot guarantee anonymity against deliberate inference; access policy and stronger cohort protections should be reviewed for enterprise use.
- Live Google OAuth, Gemini, GoEmotions inference, cameras and audio devices require configuration/device-specific verification beyond offline tests.
- No fabricated demo data is added to the production database. Browser QA records are confined to the separate `qa-browser.db`.
