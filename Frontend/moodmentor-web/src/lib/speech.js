import { useCallback, useEffect, useRef, useState } from 'react'
import { API_BASE, readSession } from './api'

export const SPEECH_LANGUAGES = [
  { id: 'en', code: 'en-IN', name: 'English', native: 'English' },
  { id: 'mr', code: 'mr-IN', name: 'Marathi', native: 'मराठी' },
  { id: 'hi', code: 'hi-IN', name: 'Hindi', native: 'हिन्दी' },
  { id: 'ml', code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം' },
  { id: 'ta', code: 'ta-IN', name: 'Tamil', native: 'தமிழ்' },
]

export function matchVoice(voices, language) {
  const code = SPEECH_LANGUAGES.find((l) => l.id === language)?.code || language
  const normalize = (value) => value.toLowerCase().replaceAll('_', '-')
  const matching = voices.filter(
    (v) => normalize(v.lang).split('-')[0] === normalize(code).split('-')[0],
  )
  return (
    matching.find(
      (v) => normalize(v.lang) === normalize(code) && v.localService,
    ) ||
    matching.find((v) => v.localService) ||
    matching.find((v) => normalize(v.lang) === normalize(code)) ||
    matching[0] ||
    null
  )
}

export function textLanguage(text, preferred = 'en') {
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'
  if (/[\u0900-\u097F]/.test(text)) return preferred === 'mr' ? 'mr' : 'hi'
  return 'en'
}

// Split longer responses so native engines do not silently truncate them.
export function speechChunks(text) {
  return (text.trim().match(/[^.!?।\n]+[.!?।\n]*/gu) || []).flatMap(
    (sentence) => {
      const chunks = []
      let rest = sentence.trim()
      while (rest.length > 220) {
        const space = rest.lastIndexOf(' ', 220)
        const end = space > 80 ? space : 220
        chunks.push(rest.slice(0, end))
        rest = rest.slice(end).trim()
      }
      if (rest) chunks.push(rest)
      return chunks
    },
  )
}

export function useNarrator() {
  const [voices, setVoices] = useState([]),
    [speaking, setSpeaking] = useState(false),
    [error, setError] = useState('')
  const generation = useRef(0),
    current = useRef(null),
    ownsSpeech = useRef(false)
  const stop = useCallback(() => {
    generation.current += 1
    if (ownsSpeech.current) window.speechSynthesis?.cancel()
    ownsSpeech.current = false
    current.current = null
    setSpeaking(false)
  }, [])
  useEffect(() => {
    const engine = window.speechSynthesis
    if (!engine) return
    const update = () => setVoices(engine.getVoices())
    update()
    engine.addEventListener('voiceschanged', update)
    const hide = () => {
      if (document.hidden) stop()
    }
    document.addEventListener('visibilitychange', hide)
    return () => {
      engine.removeEventListener('voiceschanged', update)
      document.removeEventListener('visibilitychange', hide)
      stop()
    }
  }, [stop])
  const speak = useCallback(
    (text, language, { rate = 0.9, volume = 0.8 } = {}) => {
      stop()
      setError('')
      const engine = window.speechSynthesis
      const voice = engine && matchVoice(engine.getVoices(), language)
      if (!voice) {
        setError(
          `A ${SPEECH_LANGUAGES.find((l) => l.id === language)?.name || language} voice is not available on this device. You can still read the text.`,
        )
        return false
      }
      const chunks = speechChunks(text)
      if (!chunks.length) return false
      const ticket = generation.current
      const next = (index) => {
        if (ticket !== generation.current) return
        if (index >= chunks.length) {
          current.current = null
          ownsSpeech.current = false
          setSpeaking(false)
          return
        }
        const utterance = new SpeechSynthesisUtterance(chunks[index])
        utterance.voice = voice
        utterance.lang = voice.lang
        utterance.rate = rate
        utterance.volume = volume
        utterance.onend = () => next(index + 1)
        utterance.onerror = (event) => {
          if (ticket !== generation.current) return
          ownsSpeech.current = false
          setSpeaking(false)
          current.current = null
          if (!['canceled', 'interrupted'].includes(event.error))
            setError(
              'Audio could not play. Try again or continue with the text.',
            )
        }
        current.current = utterance
        ownsSpeech.current = true
        setSpeaking(true)
        try {
          engine.speak(utterance)
        } catch {
          ownsSpeech.current = false
        setSpeaking(false)
        setError('Audio could not start. Try again from this page.')
      }
    }
    next(0)
    return true
  },
  [stop],
)
return {
  voices,
  speaking,
  error,
  speak,
  stop,
  clearError: () => setError(''),
}
}

export function useProviderTTS() {
  const [providerAvailable, setProviderAvailable] = useState(false)
  const [provider, setProvider] = useState('none')
  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState('')
  const audioRef = useRef(null)
  
  useEffect(() => {
    // Check provider status
    const token = readSession()?.token
    fetch(`${API_BASE}/voice/status`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setProviderAvailable(data.available)
        setProvider(data.provider)
      })
      .catch(() => {
        setProviderAvailable(false)
      })
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setSpeaking(false)
  }, [])

  const speak = useCallback(
    async (text, language) => {
      stop()
      setError('')

      if (!providerAvailable) {
        return false
      }

      try {
        setSpeaking(true)
        const token = readSession()?.token
        const res = await fetch(`${API_BASE}/voice/tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ text, language }),
        })

        if (!res.ok) {
          throw new Error('TTS generation failed')
        }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      
      audio.onended = () => {
        setSpeaking(false)
        URL.revokeObjectURL(url)
      }
      
      audio.onerror = () => {
        setSpeaking(false)
        setError('Failed to play audio')
        URL.revokeObjectURL(url)
      }

      audioRef.current = audio
      await audio.play()
      return true
    } catch (err) {
      setSpeaking(false)
      setError(err.message || 'TTS playback failed')
      return false
    }
  }, [providerAvailable, stop])

  return {
    providerAvailable,
    provider,
    speaking,
    error,
    speak,
    stop,
    clearError: () => setError('')
  }
}

