# Companion frontend refresh

13 September 2026 — first release of the conversation-centered direction.

Update: [Voice and visual moments](VOICE_AND_VISUALS.md) now adds microphone dictation, spoken replies, matching-language meditation audio controls, and three more image assets. The pending-work list below records the scope at the end of the first refresh.

## Experience delivered

- Original editorial landing page with large garden photography, warm cream surfaces, plum typography, serif accents, pastel sections, and interactive Breathe / Connect / Reset categories. Thrive Global informed the requested fresh, image-led direction; this implementation uses original layout, text, and generated illustrations.
- Sign-in opens Companion after optional onboarding. Existing dashboard and journal links redirect to Companion. Progress combines patterns and historical moments; account, team, settings, sessions, and human support remain available.
- Desktop navigation expands/collapses and remembers the choice. Mobile uses a dismissible drawer with Escape and keyboard focus containment.
- Chat and saved journal reflections share one chronological visual timeline. Reflection mode saves through the existing journal API; ordinary conversation uses the chat API. Their backend stores and AI context remain separate. Up to 100 recent chat messages and 50 recent reflections load in this view; searchable History remains available in Progress.
- The right panel shows a possible emotion signal from actual analysis, the current activity recommendation, and resumable activity state. No fabricated mood percentages. The panel can be closed; mobile starts with it closed and users can reveal it.
- Tools open over the conversation. Unsent text remains when opening/closing tools; failed sends preserve the draft. Starting an activity closes the tool dialog, and completing it refreshes recommendations without remounting the conversation.
- Meditation and activity cards use new imagery. Existing timed sessions, favorites, audio controls, before/after ratings, and persistence remain connected to the backend.
- Music opens Spotify or YouTube searches. Places lets users choose a category and city, then opens Google Maps. Trusted contact offers an explicit call link and settings. Mood Lens retains the existing browser camera experience, loaded only on demand.

## Integration boundaries and next releases

This is a frontend release, not completion of the full proposed roadmap. RAG retrieval and evaluation, microphone conversation and speech output, professionally reviewed meditation audio in Marathi/Hindi/English/Malayalam/Tamil, live places cards, movie recommendations, Google Photos selection, and expanded games still need implementation or provider configuration. Existing browser meditation voice availability depends on the device. Google OAuth is supported by the existing backend but needs configured credentials. Music and maps are external searches, not connected accounts or live embedded listings. No automatic family messages are sent.

Next: validate this interface with the user, then implement conversational voice and reviewed multilingual meditation, followed by consent-based personal integrations and a curated RAG knowledge base with source references and response evaluations.

## Source changes

The main changes are `src/App.jsx`, `src/pages/Landing.jsx`, `src/pages/Companion.jsx`, `src/components/CompanionTools.jsx`, `src/components/WellnessVisual.jsx`, `src/pages/Progress.jsx`, and `src/refresh.css`. Auth, Library, routing defaults, and shared icons were adjusted. Existing backend contracts were preserved.

A source/test snapshot from immediately before this refresh is in `backups/companion-refresh-before`. It contains no database copy. The archive has no Git metadata, so this is the available source rollback point.

## Visual asset provenance

Three original raster illustrations were created with the built-in ImageGen tool for this release and stored locally under `Frontend/moodmentor-web/public/images`. No API-key-based image command was used. They depict fictional subjects, not customers or testimonials. No Thrive Global imagery was copied.

Generation brief summaries:

| File | Brief | Output |
| --- | --- | --- |
| `sunlit-pause.png` | Editorial wellness photograph of a fictional Indian adult woman in cream linen, eyes closed during a sunlit pause in a lush garden; natural light and warm greenery. | 1536 × 1024 PNG |
| `walk-together.png` | Editorial photograph of fictional Indian adult friends sharing a candid laugh while walking in a leafy park; warm, natural, welcoming connection. | 1536 × 1024 PNG |
| `quiet-lake.png` | Tranquil mountain lake at dawn, pastel lavender and apricot sky, reflected blue mountains and foreground reeds; atmospheric meditation imagery. | 1536 × 1024 PNG |

Images are local and lazy loaded except the main hero. Cards use appropriate object crops through CSS. Production optimization to responsive AVIF/WebP derivatives can reduce the current PNG transfer sizes, roughly 2.2–2.5 MB each.

## Verification

Production Vite build and browser workflows are checked for this release. The browser suite in `tests/workflows.spec.js` uses a separate QA database and covers sign-up/onboarding, mobile layout, navigation collapse, saved reflection/chat reload, recommendation display, tool draft retention, music/map URLs, favorites, distress support, real timed activity pause/resume/outcome, failed authentication/send recovery, camera CSS containment, and dark mode. It includes WCAG A/AA automated checks on representative screens. Screenshots are generated under `test-results`; automated accessibility checks do not replace user testing.

Final results: production build passed; 18 backend tests passed. The real two-minute browser session passed, and the other four browser workflows passed again after the contrast, keyboard-scroll, and dialog-position fixes. Existing Python dependency deprecation warnings and a sandbox pytest-cache warning did not affect the test results.
