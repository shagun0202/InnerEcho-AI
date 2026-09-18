# MoodMentor engineering report

Date: 13 September 2026. Scope: evolve the supplied project into a coherent, runnable employee wellness product, with real persistent workflows and transparent integration limits.

## 1. Inspection

Reviewed the React/Vite application, former page components and styles, FastAPI routers, SQLAlchemy models, JWT/bcrypt authentication, GoEmotions/Gemini services, Google integrations, team features, meditation content, safety and notification code, dependencies, and configuration. The downloaded archive contains an extra outer directory and has no Git metadata, so there is no commit-based diff.

The starting implementation had mismatched journal/chat request and response shapes, Google mock-token paths, misleading notification delivery, broad integration claims, an unsafe default JWT secret, little persistent intervention feedback, and fragmented UI. The available system Python 3.9 could not run the application; a Python 3.12 environment was installed for validation.

## 2. What changed

Built a connected product around **Sense → Understand → Plan → Act → Measure → Learn**. A saved plan carries a real activity, explanation, decision trace, and safety state. A completed intervention records the user's before/after ratings and helpfulness. These observations influence later ranking.

The product starts with empty personal data. Only curated activity content is seeded. Browser QA uses a separate database with explicitly generated test accounts.

## 3. New features

- AI Wellness Command Center with mood, energy, stress, context, available time, and user-controlled alternatives.
- Mood Rescue for short resets selected from stated needs.
- Server-backed onboarding, preferences, goals, timezone, work hours, optional reminders, AI consent, and favorites.
- Persistent plans and timed sessions, progress checkpoints, pause/resume, abandonment, outcomes, and personalized ranking.
- Numeric mood trends, actual activity effectiveness, wellness and meditation streaks, milestones, recurring-context observations, and weekly reports.
- Team workspaces with invitation codes, explicit membership, optional team check-ins, named kudos, and shared campaigns.

## 4. Frontend improvements

Created an original sage/lavender visual system with shared typography, spacing, surfaces, buttons, badges, forms, skeletons, alerts, accessible native dialogs, and reduced-motion behavior. Built a responsive sidebar/mobile shell and redesigned Landing, Auth, Dashboard, Journal, AI Companion, Meditation, Wellness, Insights, History, Team, Profile, and Settings.

Empty, loading, failure, retry, and session-expiry states are explicit. Journal and chat now consume the real API contracts. Charts include textual/table alternatives. Navigation exposes a useful next action. Old replacement components and the obsolete API wrapper were removed. Existing Mood Studio remains available on demand; multilingual meditation text was extracted and retained.

## 5. Backend improvements

Added separate wellness schemas, catalog, coordinator service, and router. Validated ownership, catalog IDs, ratings, duration, timezone, consent, and session transitions. Corrected password verification for Google-only accounts and UTF-8 bcrypt limits. Profile creation now avoids duplicate first-request inserts, and signup creates a profile atomically.

Check-in time budgets survive alternative selection. A partial unique database index prevents concurrent active sessions for one user. Progress is monotonic and bounded by duration and server wall time; completion is idempotent. Logging avoids private message content. Errors returned to clients are sanitized. The original authenticated analysis and other useful API groups remain available.

## 6. Agentic architecture

The eight agent responsibilities are ordinary services in one FastAPI application:

| Responsibility | What it actually does |
| --- | --- |
| Safety | Checks configured phrases before optional AI, routes possible high distress to human support |
| Emotion | Local keyword signals or optional GoEmotions inference |
| Context | Stated context, rules, then optional consented Gemini classification |
| Recommendation | Ranks curated activities by context, time, preferences, goals, and measured outcomes |
| Coordinator | Saves the check-in, selected plan, rationale, and trace |
| Intervention | Starts and manages the user-controlled timed activity |
| Follow-up | Collects before/after mood and helpfulness at completion |
| Progress | Calculates actual streaks, trends, outcomes, and learning inputs |

There are no fake autonomous agents or background decisions. Small samples are discounted using average mood change × `n/(n+3)`. Negative outcomes can lower a type's ranking. This is interpretable adaptive scoring, not a newly trained neural network or evidence of causation.

**Interview explanation:** React is the employee's workspace. FastAPI checks identity and coordinates the wellness steps. SQLAlchemy saves private preferences, plans, and outcomes. The employee chooses an intervention and reports whether it helped. The next recommendation uses that history. Safety rules and privacy boundaries surround the loop; optional AI helps interpret text but does not control authentication, completion, or team disclosure.

## 7. Meditation improvements

Curated meditation, breathing, and grounding cards offer durations, benefits, categories, favorites, and explicit start controls. The immersive player includes real timing, progress, breathing animation, pause/continue, save/close, optional generated brown noise, volume, browser speech, and retained language guidance.

Resume loads persisted elapsed time. Full completion requests after-session mood and helpfulness, shows the measured change, and updates Insights. Meditation streaks and history use completed records; abandonment does not earn completion. Ambient sound is generated audio, not a claimed nature recording. Browser voice and camera hardware still require device-specific verification.

## 8. Google authentication and integration

Replaced the mock credential bypass with authorization-code OAuth, S256 PKCE, expiring signed state, a one-use database state record, nonce checking, verified Google ID tokens, audience/issuer validation, and verified email requirements. The client secret stays on the server. Only `openid email profile` scopes are requested, with no persisted Google access/refresh token.

Local accounts require an authenticated explicit linking flow; email coincidence does not silently link identities. Google-only users cannot unlink their sole login method. Disabled configuration and callback failures are visible. Google Photos/Contacts are honestly unavailable; Maps/Spotify/YouTube are explicit outbound searches. A live Google login requires the owner's OAuth credentials and consent-screen setup.

## 9. Security and privacy

- Production rejects a missing/short JWT secret; local development can use an ephemeral key. Tokens expire after one hour.
- Bearer sessions use session storage. HttpOnly cookies, CSRF protection, rotation, revocation, recovery, and enterprise identity remain deployment work.
- CORS is explicit, passwords use bcrypt, inputs are bounded, and a basic per-process request limiter is present.
- Private routes derive user identity from the JWT and enforce ownership.
- Team statistics use only explicit team check-ins, never journals/chat/private outcomes. Fewer than five distinct participants exposes no counts or totals.
- Optional Gemini sharing is off by default. Google identity consent does not grant private library access.
- Support resources and trusted-contact calling are available. Unconfigured external notifications return failure and never mark delivery successful.
- Secret examples are empty; local environments and databases are ignored. No real credentials were invented or embedded.

These are engineering safeguards, not a claim of clinical validation, guaranteed team anonymity, or enterprise certification.

## 10. Performance

Routes are split with React lazy imports. Charts, the session content, and camera/model code load only for their features. The production build has about **239 kB initial JavaScript (75 kB gzip)**. Insights and Mood Studio are separate bundles. AI model initialization is optional/lazy, provider calls have bounded timeouts, and the local path works without provider credentials.

Queries use user/date filters and indexed identifiers. History endpoints bound result counts. Very large histories still warrant SQL aggregation and pagination improvements before enterprise-scale deployment; no unsupported load-test claim is made.

## 11. File map

| Area | Main added/reworked files |
| --- | --- |
| App shell and design | `Frontend/moodmentor-web/src/App.jsx`, `src/app.css`, `src/components/ui.jsx`, `src/main.jsx` |
| Pages | `src/pages/{Landing,Auth,Dashboard,Journal,Companion,Library,Insights,History,Team,Profile,Studio}.jsx` |
| Interventions/support | `src/components/{PlanCard,SessionPlayer,SafetyDialog}.jsx` |
| Client infrastructure | `src/lib/{api,hooks}.js`, `src/lib/meditationContent.js` |
| Frontend tooling | `package.json`, `pnpm-lock.yaml`, `vite.config.js`, `playwright.config.js`, `tests/workflows.spec.js`, formatting configuration |
| Backend core | `Backend/app/{main,config,models,schemas,migrations,wellness_schemas}.py` |
| API | `Backend/app/routers/{auth,google_auth,integrations,journal,chat,safety,team,wellness}.py` and retained route cleanup |
| Services | `Backend/app/services/{catalog,wellness_service,emotion_service,gemini_service,chat_service,auth_service,safety_service,notification_service,google_service}.py` |
| Validation/setup | `Backend/tests/{conftest,test_workflows,test_oauth}.py`, requirement files, `pytest.ini`, both `.env.example` files |
| Documentation | `README.md`, `docs/ARCHITECTURE.md`, this report, `.gitignore` |

Retired page/component implementations, old global style entry point, compatibility API wrapper, and stale npm lockfile were removed. Historical standalone prototype/demo utilities are not used by app startup. The retained camera component was formatted and isolated in its own lazy route.

## 12. Database changes

Added `wellness_profiles`, `wellness_checkins`, `wellness_plans`, `intervention_sessions`, `wellness_teams`, `team_memberships`, and `oauth_attempts`. Added scoped team columns and Google identity migration support. Check-ins preserve available minutes; sessions preserve outcome measurements. A partial unique index enforces one active session per user.

Startup migrations are additive and idempotent; they never automatically rebuild or drop existing user tables. Old unscoped team submissions are not exposed. SQLite was tested. PostgreSQL types and indexes are considered, but a live PostgreSQL deployment and stricter historical constraints need dedicated migration verification.

## 13. Environment configuration

See the README table and `.env.example` files. Main controls are `ENVIRONMENT`, `SECRET_KEY`, `DATABASE_URL`, `FRONTEND_URL`, `CORS_ORIGINS`, `EMOTION_BACKEND`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `TEAM_MIN_SAMPLE`, and frontend `VITE_API_URL`. `TEST_BASE_URL` points browser tests at an isolated preview.

## 14. Run and validation

From the repository folder, create/activate Python 3.12, install `Backend/requirements-lock.txt`, and configure `Backend/.env` from its example. Then run `python -m uvicorn app.main:app --reload` from Backend. In `Frontend/moodmentor-web`, run `pnpm install --frozen-lockfile` and `pnpm dev`. Full PowerShell instructions and optional AI/Google setup are in the README. On the prepared Windows workspace, the two `scripts/start-*.ps1` helpers locate the installed runtimes without changing PATH.

Verified backend: **18 tests pass**. Coverage includes auth, Unicode passwords, API contracts, cross-user privacy, profiles, session ownership/timing/resume/idempotency, negative-feedback reranking, alternative time budgets, active-session uniqueness, safety ordering/delivery, team threshold/isolation, legacy migrations, and OAuth PKCE/nonce/replay/linking with substituted provider responses.

Verified browser: **5 tests pass** in Microsoft Edge, including mobile signup/onboarding, live journal/chat/safety/favorites, dark-mode accessibility, a real two-minute session with pause/reload/resume/outcome, failed-login recovery, API retry, all ten mobile workspace pages, and retained Studio route/style containment. The WCAG 2 A/AA axe scans on the mobile dashboard and dark Settings reported zero violations. These automated scans do not establish full accessibility certification.

Verified production build: **passes**, with 611 modules and no chunk-size warning. Prettier checks pass. A credential-pattern scan across 60 source/test files found no matching embedded credentials; this is a limited pattern scan, not a security audit. No local `.env` containing real credentials was created.

The dependency stack emits two upstream test-client deprecation warnings. They do not fail the tests and are recorded rather than silently suppressed.

## 15. Remaining issues and limits

Live Google, Gemini, GoEmotions, speech/audio hardware, and camera assets need configured/provider/device verification. External notification delivery, Google private-library access, push reminders, clinical contextual risk evaluation, and enterprise SSO are unavailable. Keyword emotion/safety signals can be wrong. Aggregation alone cannot prevent every inference attack.

No production deployment, penetration test, clinical validation, cross-browser certification, or load test was performed. The source archive has no Git metadata, so changes have not been committed. The product is runnable and tested locally; operational production readiness depends on the deployment controls in the README.

## 16. Recommended next improvements

1. Add same-origin cookie authentication, verified email, recovery, revocation, and enterprise SSO where required.
2. Deploy PostgreSQL with reviewed migrations, backups, retention/deletion controls, encryption, observability, and a shared gateway limiter.
3. Complete live OAuth/provider integration tests using owner-managed credentials and deployment URLs.
4. Obtain specialist safety and privacy review, localize support resources, and strengthen stable-cohort disclosure protections.
5. Expand keyboard/screen-reader/browser/device coverage and load tests; aggregate large histories in SQL.
6. Add independently consented delivery providers and narrowly scoped integrations only when the operational need and permissions are clear.
