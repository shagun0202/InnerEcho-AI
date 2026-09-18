import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, Dialog, Icon } from './ui'
import { SPEECH_LANGUAGES } from '../lib/speech'

const ERRORS = {
  'not-allowed':
    'Microphone access was denied. Allow microphone access in your browser settings, or keep typing.',
  'service-not-allowed':
    'Your browser’s speech service is unavailable. Try another supported browser or keep typing.',
  'audio-capture':
    'No microphone was found. Check your microphone connection and try again.',
  'no-speech': 'No speech was detected. Try again when you’re ready.',
  network:
    'Speech recognition could not connect. Check your connection, or keep typing.',
  'language-not-supported':
    'Your browser cannot recognize this language. Choose another language or type your message.',
}

export default function VoiceInput({
  value,
  onChange,
  disabled,
  limit,
  onActiveChange,
  onBeforeListen,
  language,
  onLanguageChange,
}) {
  const [dialog, setDialog] = useState(false),
    [active, setActive] = useState(false),
    [status, setStatus] = useState('')
  const recognition = useRef(null),
    timeout = useRef(null),
    mounted = useRef(true),
    approved = useRef(false)
  const callbacks = useRef({ onChange, onActiveChange })
  callbacks.current = { onChange, onActiveChange }
  const supported = !!(
    window.SpeechRecognition || window.webkitSpeechRecognition
  )
  function finish() {
    clearTimeout(timeout.current)
    if (mounted.current) {
      setActive(false)
      callbacks.current.onActiveChange(false)
    }
  }
  function stop() {
    const engine = recognition.current
    if (!engine) return
    clearTimeout(timeout.current)
    try {
      engine.stop()
    } catch {
      engine.abort()
    }
    timeout.current = setTimeout(() => {
      if (recognition.current !== engine) return
      recognition.current = null
      engine.abort()
      finish()
      setStatus('Microphone stopped. Review your draft before sending.')
    }, 2000)
  }
  useEffect(() => {
    if (!disabled || !recognition.current) return
    const engine = recognition.current
    recognition.current = null
    engine.abort()
    finish()
    setStatus('Microphone stopped. Your draft is still here.')
  }, [disabled])
  useEffect(() => {
    mounted.current = true
    const hide = () => {
      if (document.hidden) {
        recognition.current?.abort()
        finish()
      }
    }
    document.addEventListener('visibilitychange', hide)
    return () => {
      mounted.current = false
      clearTimeout(timeout.current)
      if (recognition.current) {
        recognition.current.onresult = null
        recognition.current.onerror = null
        recognition.current.onend = null
        recognition.current.abort()
        recognition.current = null
      }
      document.removeEventListener('visibilitychange', hide)
    }
  }, [])
  function start() {
    setDialog(false)
    onBeforeListen()
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition || recognition.current) return
    const engine = new Recognition()
    const original = value.trimEnd()
    recognition.current = engine
    engine.lang = SPEECH_LANGUAGES.find((l) => l.id === language).code
    engine.continuous = true
    engine.interimResults = true
    engine.maxAlternatives = 1
    setStatus('Connecting to your microphone…')
    setActive(true)
    onActiveChange(true)
    let failed = false,
      received = false
    engine.onstart = () => {
      if (mounted.current)
        setStatus('Listening… Speak naturally, then press Stop.')
    }
    engine.onresult = (event) => {
      if (!mounted.current || recognition.current !== engine) return
      let final = '',
        interim = ''
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) final += result[0].transcript + ' '
        else interim += result[0].transcript
      }
      if (final.trim()) {
        received = true
        const combined = [original, final.trim()].filter(Boolean).join(' ')
        callbacks.current.onChange(combined.slice(0, limit))
        if (combined.length >= limit) {
          failed = true
          setStatus(
            'The message limit was reached. Review your transcript before sending.',
          )
          engine.stop()
          return
        }
      }
      setStatus(
        interim
          ? `Hearing: ${interim}`
          : 'Listening… Press Stop when you’re finished.',
      )
    }
    engine.onerror = (event) => {
      if (!mounted.current || recognition.current !== engine) return
      failed = true
      setStatus(
        ERRORS[event.error] ||
          (event.error === 'aborted'
            ? 'Microphone stopped. Your draft is still here.'
            : 'Speech recognition stopped. Your draft is still here; you can keep typing.'),
      )
      recognition.current = null
      engine.abort()
      finish()
    }
    engine.onend = () => {
      if (!mounted.current || recognition.current !== engine) return
      recognition.current = null
      finish()
      if (!failed)
        setStatus(
          received
            ? 'Transcript ready. Edit it if needed, then press Send.'
            : 'No transcript received. Try again or type your message.',
        )
    }
    try {
      engine.start()
      timeout.current = setTimeout(() => {
        if (recognition.current === engine) stop()
      }, 60000)
    } catch {
      recognition.current = null
      finish()
      setStatus('The microphone could not start. Try again or keep typing.')
    }
  }
  return (
    <div className="voice-input">
      <button
        type="button"
        className={`voice-mic ${active ? 'is-listening' : ''}`}
        aria-label={active ? 'Stop listening' : 'Speak your message'}
        aria-pressed={active}
        disabled={disabled}
        onClick={() =>
          active
            ? stop()
            : approved.current && supported
              ? start()
              : setDialog(true)
        }
      >
        <Icon name={active ? 'stop' : 'mic'} size={18} />
        {active && <span>Stop</span>}
      </button>
      {status && (
        <div className="voice-status" role="status">
          {status}
          <button
            type="button"
            aria-label="Dismiss voice status"
            onClick={() => setStatus('')}
          >
            <Icon name="close" size={12} />
          </button>
        </div>
      )}
      {dialog &&
        createPortal(
          <Dialog
            title="A little room to talk."
            onClose={() => setDialog(false)}
          >
            <div className="voice-intro-icon">
              <Icon name="mic" size={30} />
            </div>
            {supported ? (
              <>
                <p>
                  Your browser’s speech service may process microphone audio
                  online. MoodMentor receives the transcript, and saves it only
                  when you press Send.
                </p>
                <label>
                  Speaking language
                  <select
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                  >
                    {SPEECH_LANGUAGES.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.native} · {l.name}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="quiet-note">
                  Recording stops after one minute or when you leave this page.
                  Review the transcript before sending. Language recognition
                  depends on your browser.
                </p>
                <Button
                  onClick={() => {
                    approved.current = true
                    start()
                  }}
                >
                  Start listening <Icon name="mic" size={17} />
                </Button>
              </>
            ) : (
              <>
                <p>
                  Speech recognition is not available in this browser. Open
                  MoodMentor in a browser that supports speech recognition, or
                  continue typing here.
                </p>
                <Button onClick={() => setDialog(false)}>Keep typing</Button>
              </>
            )}
          </Dialog>,
          document.body,
        )}
    </div>
  )
}
