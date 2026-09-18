# Voice and visual moments

13 September 2026 — continuation after approval of the Companion refresh.

## Delivered

- Three more original generated photographs: headphones/music, a leafy café courtyard, and outdoor badminton. They appear in a new Companion image strip, music and places tools, a tool-tray feature panel, and appropriate activity cards. All six image assets are stored locally and lazy loaded.
- A microphone control in the composer with an explicit explanation before first use, five input-language choices, live interim feedback, editable final transcript, stop control, a one-minute capture limit, permission/network/no-speech errors, and a typing fallback when recognition is unsupported. Dictation appends to an existing draft without duplicating finalized segments. It never sends automatically.
- Individual Listen controls on replies and an optional session-only setting to read new replies. Longer replies are split into sequential speech chunks. Voice selection matches the written language rather than reading English text through a Marathi/Hindi voice. This does not translate AI replies.
- Meditation voice setup before starting: language, matching voice availability, gentle/relaxed/natural pace, independent voice volume, preview, automatic instruction reading, and replay. The existing English, Marathi, Hindi, Malayalam and Tamil scripts are retained. Phase timing follows the script's authored timestamps, scaled to the chosen activity duration.
- A photographic meditation backdrop. Audio stops when leaving the page or opening another activity; a meditation pauses when the browser tab becomes hidden. Existing timed activity persistence and before/after feedback are preserved.

## Current limits

This release uses browser speech recognition and synthesis. A matching installed or browser-provided voice must exist. If a language voice is missing, its playback control is disabled and the selected guidance remains readable. It deliberately does not substitute a voice from another language. Recognition support and accuracy vary by browser and language. Browser speech services can process audio or text online; the interface explains this. MoodMentor does not record or store microphone audio, and only stores a transcript when the user sends it.

Professionally narrated, native-speaker-reviewed audio recordings for all five languages are still pending; existing translated scripts have not received a new native-speaker review during this release. Live microphone accuracy and voice pronunciation require a person to test on the intended device. Automated tests use explicit browser-API doubles to verify application behavior without recording the user.

RAG, Google Photos, live nearby-place listings, and provider-backed conversational speech remain future integrations. Music/Maps cards open actual external searches; photos are illustrations, not pictures or listings of real recommended venues.

## Browser documentation used

- [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) — browser service and support behavior.
- [MDN speech synthesis voices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event) — asynchronous voice discovery.

## Image generation record

Built-in ImageGen was used for each original image below. Prompts are recorded verbatim. Originals remain in the Codex generated-images folder; project copies are under `Frontend/moodmentor-web/public/images/`.

Saved assets:

- [music-moment.png](<C:/Users/Rushikesh Tonpe/Dropbox/PC/Downloads/Infosys-Project-Moodmentor-main/Infosys-Project-Moodmentor-main/Frontend/moodmentor-web/public/images/music-moment.png>)
- [cafe-courtyard.png](<C:/Users/Rushikesh Tonpe/Dropbox/PC/Downloads/Infosys-Project-Moodmentor-main/Infosys-Project-Moodmentor-main/Frontend/moodmentor-web/public/images/cafe-courtyard.png>)
- [park-badminton.png](<C:/Users/Rushikesh Tonpe/Dropbox/PC/Downloads/Infosys-Project-Moodmentor-main/Infosys-Project-Moodmentor-main/Frontend/moodmentor-web/public/images/park-badminton.png>)

### music-moment.png

```text
Use case: photorealistic-natural. Asset type: editorial wellness website music card, landscape 1536x1024. Create a natural candid photograph of a fictional Indian woman in her late twenties enjoying music through simple unbranded over-ear headphones, eyes softly closed, seated beside a sunny open window in a plant-filled apartment. Relaxed cream and dusty terracotta clothing, warm honey light, subtle lavender accents, authentic skin texture. Medium shot with her head and headphones clearly framed and room around the subject for responsive cropping. Refined lifestyle editorial photography, quietly joyful, realistic. No text, no logos, no watermark.
```

### cafe-courtyard.png

```text
Use case: photorealistic-natural. Asset type: editorial wellness website places card, landscape 1536x1024. Create an inviting photograph of a quiet leafy outdoor cafe courtyard in Pune-inspired Indian urban surroundings. Two ceramic cups of tea on a small round wooden table, wicker chairs, abundant potted tropical greenery, sunlit warm terracotta plaster, a softly blurred shady walkway beyond. No people. Natural editorial travel photography, tactile materials, warm cream and green palette, refreshing and welcoming. Composition readable as a wide image and square crop. No signs, no text, no logos, no watermark.
```

### park-badminton.png

```text
Use case: photorealistic-natural. Asset type: editorial wellness website outdoor activity card, landscape 1536x1024. Create a candid lifestyle photograph of two fictional Indian adult friends casually playing badminton in a green neighborhood park in late afternoon. Relaxed athletic clothes in muted sage and warm clay colors, anatomically plausible relaxed poses, lightweight rackets, net visible, trees and sunlit grass. Show the play as approachable recreation, not a professional match. Authentic natural expressions, realistic skin and fabric, editorial wellness photography, warm inviting light. Keep the main subjects in central composition for responsive crops. No text, no branding, no watermark.
```

## Verification

The browser suite covers the existing real API workflows plus voice consent, input-language selection, draft retention, final/interim recognition events, explicit send, matching reply voice, permission errors, stopping capture for tools/routes, unsupported recognition, five-language narration selection, missing voices, pause/replay, and accessibility. Speech doubles validate event and state handling, not the sound or quality of a real speech provider.

Result: all 10 browser tests passed, including the real two-minute session and representative automated WCAG checks. The production build passes. Microphone hardware accuracy and native-speaker pronunciation review remain manual verification steps.
