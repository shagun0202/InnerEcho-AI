import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { Dialog, Button, Icon, MoodPicker, Badge } from './ui'
import { BREATH_LABELS, LANGUAGES, PROGRAMS } from '../lib/meditationContent'
import { matchVoice, useNarrator, useProviderTTS } from '../lib/speech'
import { ActivityArtwork, WellnessPhoto } from './WellnessVisual'

export default function SessionPlayer({
  activity: initialActivity,
  planId,
  existing,
  onClose,
  onComplete,
}) {
  const [session, setSession] = useState(existing || null),
    [before, setBefore] = useState(existing?.mood_before || 3),
    [after, setAfter] = useState(3)
  const [elapsed, setElapsed] = useState(existing?.elapsed_seconds || 0),
    [playing, setPlaying] = useState(false),
    [phase, setPhase] = useState(existing ? 'session' : 'before')
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [helpful, setHelpful] = useState(null),
    [volume, setVolume] = useState(0.15),
    [sound, setSound] = useState('none')
  const [voice, setVoice] = useState(false),
    [language, setLanguage] = useState('en'),
    [result, setResult] = useState(null)
  const [voiceVolume, setVoiceVolume] = useState(0.8),
    [voiceRate, setVoiceRate] = useState(0.8)
  const [useAI, setUseAI] = useState(true)
  const narrator = useNarrator()
  const providerTTS = useProviderTTS()
  const activeVoice = useAI && providerTTS.providerAvailable ? providerTTS : narrator
  const selectedVoice = matchVoice(narrator.voices, language)
  const elapsedRef = useRef(elapsed),
    audioRef = useRef(null),
    voiceStep = useRef(-1)
  const activity = session?.activity || initialActivity
  const duration = session?.duration_seconds || activity.minutes * 60
  const breath = activity.type === 'breathing'
  const index = Math.min(
    activity.steps.length - 1,
    Math.floor((elapsed / duration) * activity.steps.length),
  )
  const remaining = Math.max(0, duration - Math.floor(elapsed))
  const labels = BREATH_LABELS[language]
  const script = PROGRAMS.find(
    (p) =>
      p.id ===
      {
        'meditation-5': 'stress_relief',
        'meditation-10': 'morning_focus',
        'meditation-15': 'sleep_winddown',
        'meditation-20': 'body_scan',
        'grounding-2': 'anxiety_reset',
        'breathing-3': 'stress_relief',
      }[activity.id],
  )
  const scriptTime = script ? (elapsed / duration) * script.duration : 0
  const localizedPhase =
    script?.phases.find((p) => scriptTime >= p.start && scriptTime < p.end) ||
    script?.phases.at(-1)
  const instruction =
    language === 'en'
      ? activity.steps[index]
      : localizedPhase?.instruction[language] || activity.steps[index]
  const narration =
    language === 'en'
      ? instruction
      : localizedPhase?.voice[language] || instruction
  useEffect(() => {
    elapsedRef.current = elapsed
  }, [elapsed])
  useEffect(() => {
    if (!playing) return
    let previous = performance.now()
    const timer = setInterval(() => {
      const now = performance.now(),
        delta = (now - previous) / 1000
      previous = now
      setElapsed((v) => Math.min(duration, v + delta))
    }, 250)
    return () => clearInterval(timer)
  }, [playing, duration])
  useEffect(() => {
    if (elapsed >= duration && phase === 'session') {
      setPlaying(false)
      setPhase('after')
    }
  }, [elapsed, duration, phase])
  useEffect(() => {
    if (!session || phase === 'done') return
    const timer = setInterval(() => {
      api(`/wellness/sessions/${session.id}`, {
        method: 'PATCH',
        body: { elapsed_seconds: Math.floor(elapsedRef.current) },
      }).catch((e) => setError(`Progress has not synced: ${e.message}`))
    }, 15000)
    return () => clearInterval(timer)
  }, [session, phase])
  useEffect(() => {
    if (!playing || sound === 'none') return
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)(),
        gain = ctx.createGain(),
        noise = ctx.createBufferSource()
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate),
        data = buffer.getChannelData(0)
      let previous = 0
      for (let i = 0; i < data.length; i++) {
        previous = (previous + 0.02 * (Math.random() * 2 - 1)) / 1.02
        data[i] = previous * 3.5
      }
      noise.buffer = buffer
      noise.loop = true
      gain.gain.value = volume
      noise.connect(gain)
      gain.connect(ctx.destination)
      noise.start()
      ctx.resume()
      audioRef.current = { ctx, gain }
      return () => {
        noise.stop()
        ctx.close()
        audioRef.current = null
      }
    } catch {
      setError(
        'Ambient sound is unavailable in this browser. You can continue in silence.',
      )
    }
  }, [playing, sound])
  useEffect(() => {
    if (audioRef.current) audioRef.current.gain.gain.value = volume
  }, [volume])
  useEffect(() => {
    if (!voice || !playing) {
      activeVoice.stop()
      voiceStep.current = ''
      return
    }
    const key = narration + language
    if (voiceStep.current === key) return
    voiceStep.current = key
    
    // activeVoice could be providerTTS or narrator
    activeVoice.speak(narration, language, {
      rate: voiceRate,
      volume: voiceVolume,
    })
  }, [
    narration,
    voice,
    playing,
    language,
    selectedVoice?.voiceURI,
    voiceRate,
    voiceVolume,
    activeVoice,
  ])
  useEffect(() => {
    const hide = () => {
      if (document.hidden) setPlaying(false)
    }
    document.addEventListener('visibilitychange', hide)
    return () => document.removeEventListener('visibilitychange', hide)
  }, [])
  async function start() {
    narrator.stop()
    setBusy(true)
    setError('')
    try {
      const r = await api('/wellness/sessions', {
        method: 'POST',
        body: {
          activity_key: activity.id,
          plan_id: planId || null,
          mood_before: before,
        },
      })
      setSession(r)
      setPhase('session')
      setPlaying(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  async function close() {
    narrator.stop()
    setPlaying(false)
    if (session && phase !== 'done') {
      setBusy(true)
      try {
        await api(`/wellness/sessions/${session.id}`, {
          method: 'PATCH',
          body: { elapsed_seconds: Math.floor(elapsedRef.current) },
        })
        onClose()
      } catch (e) {
        setError(`Could not save progress. ${e.message}`)
      } finally {
        setBusy(false)
      }
    } else onClose()
  }
  async function abandon() {
    setBusy(true)
    setError('')
    try {
      await api(`/wellness/sessions/${session.id}/abandon`, { method: 'POST' })
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  async function complete() {
    setBusy(true)
    setError('')
    try {
      const r = await api(`/wellness/sessions/${session.id}/complete`, {
        method: 'POST',
        body: {
          elapsed_seconds: Math.floor(elapsed),
          mood_after: after,
          helpful,
        },
      })
      setResult(r)
      setPhase('done')
      onComplete()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog title={activity.title} wide onClose={busy ? () => {} : close}>
      <div className={`session-player stage-${phase}`}>
        {phase === 'before' && (
          <ActivityArtwork type={activity.type} className="session-cover" />
        )}
        <div className="session-meta">
          <Badge>{activity.type}</Badge>
          <span>
            {activity.minutes} minutes · {activity.level}
          </span>
        </div>
        {['before', 'session'].includes(phase) && (
          <div className="narration-setup">
            <div className="narration-heading">
              <span>
                <Icon name="volume" size={17} />
                <b>Your audio guide</b>
              </span>
              <small>At your own pace</small>
            </div>
            <div className="narration-options">
              <label>
                Guidance language
                <select
                  value={language}
                  onChange={(e) => {
                    narrator.stop()
                    voiceStep.current = ''
                    setLanguage(e.target.value)
                  }}
                >
                  {(script
                    ? LANGUAGES
                    : LANGUAGES.filter((l) => l.id === 'en')
                  ).map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.native} · {l.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Voice pace
                <select
                  value={voiceRate}
                  onChange={(e) => {
                    voiceStep.current = ''
                    setVoiceRate(+e.target.value)
                  }}
                >
                  <option value="0.7">Gentle</option>
                  <option value="0.8">Relaxed</option>
                  <option value="1">Natural</option>
                </select>
              </label>
              <label>
                Voice volume
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={voiceVolume}
                  onChange={(e) => setVoiceVolume(+e.target.value)}
                />
              </label>
            </div>
            <div className="narration-actions">
              {providerTTS.providerAvailable && (
                <label className="checkbox-label" style={{ display: 'block', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => {
                      setUseAI(e.target.checked)
                      activeVoice.stop()
                      voiceStep.current = ''
                    }}
                  />
                  Use AI Voice
                </label>
              )}
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={voice}
                  disabled={!useAI && !selectedVoice}
                  onChange={(e) => {
                    setVoice(e.target.checked)
                    voiceStep.current = ''
                    if (!e.target.checked) activeVoice.stop()
                  }}
                />
                Read guidance aloud
              </label>
              <Button
                variant="secondary"
                disabled={!useAI && !selectedVoice}
                onClick={() =>
                  activeVoice.speaking
                    ? activeVoice.stop()
                    : activeVoice.speak(narration, language, {
                        rate: voiceRate,
                        volume: voiceVolume,
                      })
                }
              >
                <Icon name={activeVoice.speaking ? 'stop' : 'volume'} size={15} />
                {activeVoice.speaking
                  ? 'Stop audio'
                  : phase === 'before'
                    ? 'Preview voice'
                    : 'Replay guidance'}
              </Button>
            </div>
            <p className="voice-availability" role="status">
              {useAI && providerTTS.providerAvailable 
                ? 'AI-generated narration'
                : selectedVoice
                ? `${selectedVoice.name} · ${selectedVoice.localService ? 'Device voice' : 'Online browser voice'}`
                : `No ${LANGUAGES.find((l) => l.id === language)?.name} voice is available on this device. The guidance text is still available.`}
            </p>
            {activeVoice.error && (
              <p className="inline-error" role="status">
                {activeVoice.error}
              </p>
            )}
            <p className="quiet-note">
              {useAI && providerTTS.providerAvailable ? 'AI speech service reads the guidance.' : 'Your device or browser speech service reads the guidance.'} Preview
              it before closing your eyes. Audio is optional.
            </p>
          </div>
        )}
        {phase === 'before' ? (
          <>
            <p className="player-lead">{activity.benefit}</p>
            <MoodPicker
              value={before}
              onChange={setBefore}
              label="Before we begin, how do you feel?"
            />
            <p className="quiet-note">
              Your before-and-after check-in helps us understand which
              activities work for you.
            </p>
            <Button disabled={busy} onClick={start}>
              {busy ? 'Starting…' : 'Begin this moment'}
              <Icon name="play" size={18} />
            </Button>
          </>
        ) : phase === 'session' ? (
          <>
            <div className="session-visual">
              <WellnessPhoto scene="calm" />
              <div
                className={`breathing-orb ${playing && breath ? 'breathing' : ''}`}
                style={{ animationPlayState: playing ? 'running' : 'paused' }}
              >
                <span className="timer">
                  {Math.floor(remaining / 60)}:
                  {String(remaining % 60).padStart(2, '0')}
                </span>
                <span>
                  {breath
                    ? Math.floor(elapsed) % 10 < 4
                      ? labels.inhale
                      : labels.exhale
                    : 'A LITTLE SPACE FOR YOU'}
                </span>
              </div>
            </div>
            <p className="session-instruction" aria-live="polite">
              {instruction}
            </p>
            <progress max={duration} value={elapsed} />
            <div className="player-controls">
              <Button
                onClick={() => {
                  voiceStep.current = -1
                  setPlaying(!playing)
                }}
              >
                {playing ? 'Pause' : 'Continue'}
                <Icon name={playing ? 'clock' : 'play'} size={18} />
              </Button>
              <Button variant="secondary" disabled={busy} onClick={close}>
                Save & close
              </Button>
            </div>
            <div className="audio-controls">
              <label>
                Background
                <select
                  value={sound}
                  onChange={(e) => setSound(e.target.value)}
                >
                  <option value="none">Silence</option>
                  <option value="brown">Soft brown noise</option>
                </select>
              </label>
              <label>
                Volume
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(+e.target.value)}
                />
              </label>
            </div>
            <p className="quiet-note">
              Pause or stop if anything feels uncomfortable. Leaving this tab
              pauses your session and audio.
            </p>
            <button className="text-button" disabled={busy} onClick={abandon}>
              End without recording completion
            </button>
          </>
        ) : phase === 'after' ? (
          <>
            <span className="completion-icon">
              <Icon name="check" size={36} />
            </span>
            <h2>You made a little room.</h2>
            <p>No need to feel different. An honest check-in is what helps.</p>
            <MoodPicker
              value={after}
              onChange={setAfter}
              label="How do you feel now?"
            />
            <fieldset className="feedback-field">
              <legend>Was this activity useful for you?</legend>
              <div className="button-row">
                <Button
                  variant={helpful === true ? 'primary' : 'secondary'}
                  aria-pressed={helpful === true}
                  onClick={() => setHelpful(true)}
                >
                  Yes, it helped
                </Button>
                <Button
                  variant={helpful === false ? 'primary' : 'secondary'}
                  aria-pressed={helpful === false}
                  onClick={() => setHelpful(false)}
                >
                  Not this time
                </Button>
              </div>
            </fieldset>
            <Button onClick={complete} disabled={busy || helpful === null}>
              {busy ? 'Saving…' : 'Save my check-in'}
            </Button>
          </>
        ) : (
          <>
            <span className="completion-icon">
              <Icon name="check" size={36} />
            </span>
            <h2>One moment, remembered.</h2>
            <p>Your session and feedback are saved.</p>
            <div className="outcome-comparison">
              <div>
                <span>Before</span>
                <b>{result.mood_before}/5</b>
              </div>
              <Icon name="arrow" />
              <div>
                <span>After</span>
                <b>{result.mood_after}/5</b>
              </div>
            </div>
            <p>
              Mood change: {result.mood_change > 0 ? '+' : ''}
              {result.mood_change}. Your future suggestions will take this
              feedback into account.
            </p>
            <Button onClick={onClose}>
              Back to my day
              <Icon name="arrow" size={17} />
            </Button>
          </>
        )}
        {error && (
          <p role="alert" className="inline-error">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  )
}
