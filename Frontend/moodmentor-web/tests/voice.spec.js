import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { matchVoice, speechChunks, textLanguage } from '../src/lib/speech'

const API = process.env.TEST_API_URL || 'http://127.0.0.1:8001'
async function enter(page, request) {
  const response = await request.post(`${API}/auth/signup`, {
    data: {
      name: 'Voice QA',
      email: `voice-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
      password: 'Qa-password-123',
    },
  })
  expect(response.ok()).toBeTruthy()
  const account = await response.json(),
    headers = { Authorization: `Bearer ${account.access_token}` }
  const profile = await (
    await request.get(`${API}/wellness/profile`, { headers })
  ).json()
  expect(
    (
      await request.put(`${API}/wellness/profile`, {
        headers,
        data: { ...profile, onboarded: true },
      })
    ).ok(),
  ).toBeTruthy()
  await page.goto('/')
  await page.evaluate(
    (a) =>
      sessionStorage.setItem(
        'moodmentor-session-v2',
        JSON.stringify({ token: a.access_token, user: a.user }),
      ),
    account,
  )
  await page.reload()
  await expect(page.getByLabel('Your message', { exact: true })).toBeVisible()
}

// Hardware and provider-independent contract tests. These do not claim to validate
// real microphone transcription accuracy or the sound of installed voices.
async function speechDouble(page) {
  await page.addInitScript(() => {
    window.voiceQA = {
      starts: 0,
      stops: 0,
      aborts: 0,
      spoken: [],
      cancels: 0,
      voices: ['en', 'mr', 'hi', 'ml', 'ta'].map((code) => ({
        name: `Test ${code}`,
        voiceURI: `test-${code}`,
        lang: `${code}-IN`,
        localService: true,
      })),
    }
    class Recognition {
      constructor() {
        window.voiceQA.recognition = this
      }
      start() {
        window.voiceQA.starts++
        this.onstart?.()
      }
      stop() {
        window.voiceQA.stops++
        this.onend?.()
      }
      abort() {
        window.voiceQA.aborts++
        this.onend?.()
      }
    }
    window.SpeechRecognition = Recognition
    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text
      }
    }
    const events = new EventTarget()
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => window.voiceQA.voices,
        addEventListener: (...args) => events.addEventListener(...args),
        removeEventListener: (...args) => events.removeEventListener(...args),
        cancel: () => {
          window.voiceQA.cancels++
        },
        speak: (u) => {
          window.voiceQA.spoken.push({
            text: u.text,
            lang: u.lang,
            volume: u.volume,
            rate: u.rate,
          })
          window.voiceQA.utterance = u
        },
      },
    })
    window.voiceQA.updateVoices = () =>
      events.dispatchEvent(new Event('voiceschanged'))
    window.voiceQA.result = (items) =>
      window.voiceQA.recognition.onresult({
        results: items.map(([transcript, isFinal]) =>
          Object.assign([{ transcript }], { isFinal }),
        ),
      })
  })
}

test('speech matching never substitutes another language and splits long replies', () => {
  const voices = [
    { lang: 'en-US', localService: true },
    { lang: 'hi-IN', localService: false },
    { lang: 'hi-IN', localService: true },
  ]
  expect(matchVoice(voices, 'mr')).toBeNull()
  expect(matchVoice(voices, 'hi')).toBe(voices[2])
  expect(textLanguage('नमस्कार', 'mr')).toBe('mr')
  expect(textLanguage('வணக்கம்')).toBe('ta')
  expect(textLanguage('നമസ്കാരം')).toBe('ml')
  expect(textLanguage('A calm moment', 'hi')).toBe('en')
  const text = 'A small pause helps. ' + 'word '.repeat(150) + 'Next sentence.'
  const chunks = speechChunks(text)
  expect(chunks.every((chunk) => chunk.length <= 220)).toBe(true)
  expect(chunks.join(' ').replace(/\s+/g, ' ')).toBe(
    text.trim().replace(/\s+/g, ' '),
  )
})

test('dictation asks first, preserves drafts, handles interim results and only sends on request', async ({
  page,
  request,
}) => {
  await speechDouble(page)
  await enter(page, request)
  await page
    .getByLabel('Your message', { exact: true })
    .fill('My existing thought.')
  await page.getByRole('button', { name: 'Speak your message' }).click()
  await expect(
    page.getByRole('dialog', { name: 'A little room to talk.' }),
  ).toBeVisible()
  expect(await page.evaluate(() => window.voiceQA.starts)).toBe(0)
  await page.getByLabel('Speaking language').selectOption('mr')
  await page.getByRole('button', { name: 'Start listening' }).click()
  expect(await page.evaluate(() => window.voiceQA.recognition.lang)).toBe(
    'mr-IN',
  )
  await expect(
    page.getByRole('button', { name: 'Send message' }),
  ).toBeDisabled()
  await page.evaluate(() => window.voiceQA.result([['आजचा दिवस', false]]))
  await expect(page.getByLabel('Your message', { exact: true })).toHaveValue(
    'My existing thought.',
  )
  await page.evaluate(() =>
    window.voiceQA.result([['आजचा दिवस चांगला होता.', true]]),
  )
  await page.evaluate(() =>
    window.voiceQA.result([
      ['आजचा दिवस चांगला होता.', true],
      ['थोडा थकलो आहे.', true],
    ]),
  )
  await page.getByRole('button', { name: 'Stop listening' }).click()
  await expect(page.getByLabel('Your message', { exact: true })).toHaveValue(
    'My existing thought. आजचा दिवस चांगला होता. थोडा थकलो आहे.',
  )
  await expect(page.locator('.conversation-message')).toHaveCount(0)
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.locator('.conversation-message.assistant')).toHaveCount(1)
  await page.getByRole('button', { name: 'Read reply aloud' }).click()
  expect(await page.evaluate(() => window.voiceQA.spoken.at(-1).lang)).toBe(
    'en-IN',
  )
  await page.getByRole('button', { name: 'Music', exact: true }).click()
  expect(await page.evaluate(() => window.voiceQA.cancels)).toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await expect(
    page.getByRole('button', { name: 'Read reply aloud' }),
  ).toBeVisible()
})

test('microphone errors and route changes stop capture without losing the draft', async ({
  page,
  request,
}) => {
  await speechDouble(page)
  await enter(page, request)
  await page
    .getByLabel('Your message', { exact: true })
    .fill('Keep this thought.')
  await page.getByRole('button', { name: 'Speak your message' }).click()
  await page.getByRole('button', { name: 'Start listening' }).click()
  await page.evaluate(() =>
    window.voiceQA.recognition.onerror({ error: 'not-allowed' }),
  )
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: 'Microphone access was denied' }),
  ).toBeVisible()
  await expect(page.getByLabel('Your message', { exact: true })).toHaveValue(
    'Keep this thought.',
  )
  await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled()
  await page.getByRole('button', { name: 'Speak your message' }).click()
  await page.getByRole('button', { name: 'A quieter mind' }).click()
  await expect(
    page.getByRole('dialog', { name: 'Meditation', exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(() => window.voiceQA.aborts),
  ).toBeGreaterThanOrEqual(2)
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await expect(page.getByLabel('Your message', { exact: true })).toHaveValue(
    'Keep this thought.',
  )
  await page.getByRole('button', { name: 'Speak your message' }).click()
  const before = await page.evaluate(() => window.voiceQA.aborts)
  await page.getByRole('link', { name: 'Progress', exact: true }).click()
  expect(await page.evaluate(() => window.voiceQA.aborts)).toBeGreaterThan(
    before,
  )
})

test('unsupported speech recognition offers typing without requesting a microphone', async ({
  page,
  request,
}) => {
  await page.addInitScript(() => {
    window.SpeechRecognition = undefined
    window.webkitSpeechRecognition = undefined
  })
  await enter(page, request)
  await page.getByRole('button', { name: 'Speak your message' }).click()
  await expect(
    page.getByText(/Speech recognition is not available in this browser/),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Keep typing' }).click()
  await expect(page.getByLabel('Your message', { exact: true })).toBeEnabled()
})

test('meditation previews five matching voices, pauses audio and handles a missing language', async ({
  page,
  request,
}) => {
  await speechDouble(page)
  await enter(page, request)
  await page.getByRole('button', { name: 'Meditation', exact: true }).click()
  await page
    .locator('.library-card')
    .filter({
      has: page.getByRole('heading', { name: 'Come back to this moment' }),
    })
    .getByRole('button', { name: 'Start', exact: true })
    .click()
  for (const language of ['en', 'mr', 'hi', 'ml', 'ta']) {
    await page.getByLabel('Guidance language').selectOption(language)
    await page.getByRole('button', { name: 'Preview voice' }).click()
    expect(await page.evaluate(() => window.voiceQA.spoken.at(-1).lang)).toBe(
      `${language}-IN`,
    )
    await page.getByRole('button', { name: 'Stop audio', exact: true }).click()
  }
  await page.getByLabel('Guidance language').selectOption('mr')
  await page.getByLabel('Read guidance aloud', { exact: true }).check()
  await page.getByRole('button', { name: 'Begin this moment' }).click()
  await expect(page.locator('.session-instruction')).toContainText(
    /[\u0900-\u097f]/,
  )
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Replay guidance' }),
  ).toBeVisible()
  await page.evaluate(() => {
    window.voiceQA.voices = window.voiceQA.voices.filter(
      (v) => v.lang !== 'mr-IN',
    )
    window.voiceQA.updateVoices()
  })
  await expect(page.getByText(/No Marathi voice is available/)).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Replay guidance' }),
  ).toBeDisabled()
  await page.getByLabel('Guidance language').selectOption('hi')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  expect(await page.evaluate(() => window.voiceQA.spoken.at(-1).lang)).toBe(
    'hi-IN',
  )
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  await page.screenshot({
    path: 'test-results/meditation-voice.png',
    fullPage: true,
  })
  const a11y = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  expect(
    a11y.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([])
  await page.getByRole('button', { name: 'Save & close' }).click()
  await expect(page.getByLabel('Your message', { exact: true })).toBeVisible()
})
