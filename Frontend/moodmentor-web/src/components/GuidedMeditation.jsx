import React, { useState, useEffect, useRef } from 'react'

const TRACKS = [
  {
    id: 'work_stress',
    name: 'Work Stress Relief',
    category: 'Workplace Calm',
    duration: 180,
    icon: '🌿',
    color: '#10b981',
    description: 'Release workday pressure, tight shoulders, and mental overload.',
    ambient: 'alpha432',
    prompts: [
      { time: 0, text: 'Find a comfortable seat. Let your hands rest softly in your lap.' },
      { time: 15, text: 'Roll your shoulders gently back and down. Let go of work tension.' },
      { time: 30, text: 'Inhale slowly through your nose, and let out a long, relaxing sigh.' },
      { time: 50, text: 'Whatever tasks or meetings happened today, set them down for now.' },
      { time: 75, text: 'Notice your jaw and forehead. Allow them to unclench completely.' },
      { time: 105, text: 'You do not need to solve anything in this moment. You are safe.' },
      { time: 135, text: 'Feel the grounded stillness beneath you. Breathe naturally.' },
      { time: 160, text: 'Take one last nourishing breath, bringing renewed calm back to your day.' },
    ]
  },
  {
    id: 'body_scan',
    name: 'Progressive Body Scan',
    category: 'Deep Relaxation',
    duration: 300,
    icon: '🧘',
    color: '#6366f1',
    description: 'A head-to-toe guided awareness to dissolve physical tightness.',
    ambient: 'singing_bowl',
    prompts: [
      { time: 0, text: 'Close your eyes. Bring your gentle attention to the crown of your head.' },
      { time: 25, text: 'Softly relax the muscles around your eyes, cheeks, and mouth.' },
      { time: 55, text: 'Move your awareness down to your neck and shoulders. Let them drop.' },
      { time: 95, text: 'Feel your chest rise and fall. Breathe spaciousness into your heart.' },
      { time: 140, text: 'Release any grip in your stomach. Soften your breath.' },
      { time: 185, text: 'Notice your hands, fingers, and arms. Feel warmth resting there.' },
      { time: 230, text: 'Bring awareness down to your hips, legs, and feet resting on the floor.' },
      { time: 275, text: 'Your entire body is relaxed, rested, and at ease.' },
    ]
  },
  {
    id: 'morning_focus',
    name: 'Morning Focus & Clarity',
    category: 'Energy & Intent',
    duration: 120,
    icon: '🌅',
    color: '#f59e0b',
    description: 'Awaken mental clarity and quiet confidence for your day ahead.',
    ambient: 'alpha432',
    prompts: [
      { time: 0, text: 'Sit tall with an open chest. Welcome this fresh moment.' },
      { time: 15, text: 'Take a deep, invigorating breath in. Fill your lungs with fresh energy.' },
      { time: 35, text: 'Exhale with clarity. Clear away any morning fog or hesitation.' },
      { time: 60, text: 'Set an intention for today: calm focus, steady presence, and kindness.' },
      { time: 90, text: 'Trust your ability to handle whatever comes today with ease.' },
      { time: 110, text: 'Open your eyes with a clear, focused mind. You are ready.' },
    ]
  },
  {
    id: 'sleep_winddown',
    name: 'Evening Sleep Wind-Down',
    category: 'Restful Sleep',
    duration: 300,
    icon: '🌙',
    color: '#8b5cf6',
    description: 'Quiet an overactive mind and prepare your body for deep rest.',
    ambient: 'rain',
    prompts: [
      { time: 0, text: 'Dim your surroundings. Allow your eyes to softly close.' },
      { time: 30, text: 'The day is now complete. There is nothing left for you to do.' },
      { time: 70, text: 'Take a deep, slow breath in, and let your whole body sink down.' },
      { time: 120, text: 'With every exhale, imagine tension melting away into the night.' },
      { time: 180, text: 'Your mind is quiet like calm, still water. Completely peaceful.' },
      { time: 240, text: 'Surrender to rest. You are safe, comforted, and cared for.' },
      { time: 285, text: 'Drift into sweet, restorative sleep...' },
    ]
  },
  {
    id: 'quick_reset',
    name: '60-Second Instant Reset',
    category: 'Quick Micro-Break',
    duration: 60,
    icon: '⚡',
    color: '#06b6d4',
    description: 'A rapid 1-minute mindfulness pause for instant mental reboot.',
    ambient: 'alpha432',
    prompts: [
      { time: 0, text: 'Stop whatever you are doing. Plant your feet flat on the floor.' },
      { time: 12, text: 'Inhale deeply for 4 seconds... 1, 2, 3, 4.' },
      { time: 24, text: 'Hold that peaceful breath for 2 seconds.' },
      { time: 36, text: 'Exhale slowly through your mouth for 6 seconds.' },
      { time: 50, text: 'Notice the immediate calm. Return to your day centered.' },
    ]
  }
]

const AMBIENT_SOUNDS = [
  { id: 'alpha432', name: '432Hz Miracle Tone', icon: '🎵' },
  { id: 'singing_bowl', name: 'Singing Bowl Drone', icon: '🔔' },
  { id: 'rain', name: 'Gentle Zen Rain', icon: '🌧️' },
  { id: 'ocean', name: 'Ocean Waves', icon: '🌊' },
  { id: 'none', name: 'Mute Background', icon: '🔇' },
]

export default function GuidedMeditation() {
  const [activeTrack, setActiveTrack] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState(true)
  const [selectedAmbient, setSelectedAmbient] = useState('alpha432')
  const [ambientVolume, setAmbientVolume] = useState(0.5)

  const audioCtxRef = useRef(null)
  const ambientNodesRef = useRef([])
  const lastSpokenPromptRef = useRef('')

  // Zen Singing Bowl chime using Web Audio API
  const playZenChime = (type = 'start') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx()
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()

      const now = ctx.currentTime
      const freqs = type === 'end' ? [264, 528, 792, 1056] : [396, 528, 792]
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)
        const initGain = 0.15 / (i + 1)
        gain.gain.setValueAtTime(initGain, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (type === 'end' ? 5.5 : 4.0))
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + (type === 'end' ? 5.5 : 4.0))
      })
    } catch (e) {
      console.warn('Audio chime error:', e)
    }
  }

  // Synthesize ambient background soundscapes
  const startAmbientAudio = (soundId, volume = 0.5) => {
    stopAmbientAudio()
    if (soundId === 'none') return

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx()
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()

      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime)
      masterGain.gain.linearRampToValueAtTime(volume * 0.18, ctx.currentTime + 3)
      masterGain.connect(ctx.destination)

      const nodes = [masterGain]

      if (soundId === 'alpha432') {
        // 432Hz Pure Alpha Tone + 8Hz Binaural pulse
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        osc1.type = 'sine'
        osc2.type = 'sine'
        osc1.frequency.setValueAtTime(432, ctx.currentTime)
        osc2.frequency.setValueAtTime(440, ctx.currentTime) // 8Hz binaural alpha wave

        const g1 = ctx.createGain()
        const g2 = ctx.createGain()
        g1.gain.value = 0.5
        g2.gain.value = 0.5

        osc1.connect(g1)
        osc2.connect(g2)
        g1.connect(masterGain)
        g2.connect(masterGain)

        osc1.start()
        osc2.start()
        nodes.push(osc1, osc2, g1, g2)
      } else if (soundId === 'singing_bowl') {
        // Resonant bowl drone
        const freqs = [108, 216, 432]
        freqs.forEach(f => {
          const osc = ctx.createOscillator()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(f, ctx.currentTime)
          osc.connect(masterGain)
          osc.start()
          nodes.push(osc)
        })
      } else if (soundId === 'rain' || soundId === 'ocean') {
        // Pink / Brown filtered noise
        const bufferSize = ctx.sampleRate * 2
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        let lastOut = 0.0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          output[i] = (lastOut + (0.02 * white)) / 1.02
          lastOut = output[i]
          output[i] *= 3.5
        }

        const whiteNoise = ctx.createBufferSource()
        whiteNoise.buffer = noiseBuffer
        whiteNoise.loop = true

        const filter = ctx.createBiquadFilter()
        filter.type = soundId === 'ocean' ? 'lowpass' : 'bandpass'
        filter.frequency.setValueAtTime(soundId === 'ocean' ? 350 : 800, ctx.currentTime)

        whiteNoise.connect(filter)
        filter.connect(masterGain)
        whiteNoise.start()
        nodes.push(whiteNoise, filter)
      }

      ambientNodesRef.current = nodes
    } catch (e) {
      console.warn('Ambient start error:', e)
    }
  }

  const stopAmbientAudio = () => {
    if (ambientNodesRef.current.length && audioCtxRef.current) {
      try {
        const master = ambientNodesRef.current[0]
        if (master?.gain) {
          master.gain.linearRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 1.5)
        }
        setTimeout(() => {
          ambientNodesRef.current.forEach(n => {
            try { n.stop?.(); n.disconnect?.() } catch {}
          })
          ambientNodesRef.current = []
        }, 1500)
      } catch {
        ambientNodesRef.current = []
      }
    }
  }

  // Voice Guidance (Speech Synthesis)
  const speakGuide = (text) => {
    if (!voiceGuideEnabled || !window.speechSynthesis) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.86
    utterance.pitch = 0.98

    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Female')))
    if (preferred) utterance.voice = preferred

    window.speechSynthesis.speak(utterance)
  }

  // Timer Countdown Effect
  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      setIsActive(false)
      setIsComplete(true)
      stopAmbientAudio()
      if (window.speechSynthesis) window.speechSynthesis.cancel()
      playZenChime('end')
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  // Track prompt progression & Voice triggering
  useEffect(() => {
    if (activeTrack && isActive) {
      const elapsed = activeTrack.duration - timeLeft
      const promptObj = [...activeTrack.prompts].reverse().find(p => elapsed >= p.time)
      if (promptObj && promptObj.text !== lastSpokenPromptRef.current) {
        setCurrentPrompt(promptObj.text)
        lastSpokenPromptRef.current = promptObj.text
        speakGuide(promptObj.text)
      }
    }
  }, [timeLeft, activeTrack, isActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbientAudio()
      if (window.speechSynthesis) window.speechSynthesis.cancel()
    }
  }, [])

  const startSession = (track) => {
    setActiveTrack(track)
    setTimeLeft(track.duration)
    setIsActive(true)
    setIsComplete(false)
    lastSpokenPromptRef.current = ''
    setSelectedAmbient(track.ambient || 'alpha432')

    // Play gong chime & start ambient
    playZenChime('start')
    startAmbientAudio(track.ambient || 'alpha432', ambientVolume)
  }

  const cancelSession = () => {
    setIsActive(false)
    setActiveTrack(null)
    setTimeLeft(0)
    setIsComplete(false)
    stopAmbientAudio()
    if (window.speechSynthesis) window.speechSynthesis.cancel()
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="meditation-page">
      {!isActive && !isComplete && (
        <>
          <div className="meditation-header-banner">
            <span className="meditation-main-icon">🧘</span>
            <h2>Mindful Meditation Sanctuary</h2>
            <p>Put on your headphones, close your eyes, and let our voice guide & healing frequencies calm your mind.</p>
            
            <div className="meditation-settings-bar">
              <label className="voice-guide-toggle">
                <input 
                  type="checkbox" 
                  checked={voiceGuideEnabled} 
                  onChange={(e) => setVoiceGuideEnabled(e.target.checked)} 
                />
                <span>🎙️ Spoken Voice Guide {voiceGuideEnabled ? 'Active' : 'Off'}</span>
              </label>
              <div className="ambient-select-wrapper">
                <span className="ambient-label">Healing Audio:</span>
                <select 
                  value={selectedAmbient} 
                  onChange={(e) => setSelectedAmbient(e.target.value)}
                  className="ambient-dropdown"
                >
                  {AMBIENT_SOUNDS.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="session-cards">
            {TRACKS.map(track => (
              <div 
                key={track.id} 
                className="session-card"
                onClick={() => startSession(track)}
                style={{ borderColor: track.color }}
              >
                <span className="session-icon">{track.icon}</span>
                <div className="session-category-badge" style={{ color: track.color }}>{track.category}</div>
                <b>{track.name}</b>
                <small className="session-duration">⏱ {track.duration / 60} min · Guided</small>
                <p className="session-desc">{track.description}</p>
                <button className="start-session-btn" style={{ background: track.color }}>Begin Sanctuary →</button>
              </div>
            ))}
          </div>
        </>
      )}

      {isActive && activeTrack && (
        <div className="session-active-immersive">
          <div className="immersive-top-bar">
            <span className="track-title-badge">{activeTrack.icon} {activeTrack.name}</span>
            <div className="live-status-pill">
              <span className="live-dot"></span>
              {voiceGuideEnabled ? '🎙️ Voice Guide Speaking' : 'Silent Reflection'}
            </div>
          </div>

          <div className="meditation-timer">
            <svg viewBox="0 0 100 100">
              <circle className="ring-bg" cx="50" cy="50" r="45" />
              <circle 
                className="ring-fill"
                cx="50" 
                cy="50" 
                r="45" 
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * timeLeft) / activeTrack.duration}
                style={{ stroke: activeTrack.color }}
              />
            </svg>
            <div className="timer-text">
              <b>{formatTime(timeLeft)}</b>
              <small>REMAINING</small>
            </div>
          </div>

          <div className="meditation-prompt-card">
            <p className="prompt-text">"{currentPrompt}"</p>
            <div className="eyes-closed-hint">
              <span>🌿 Close your eyes and gently follow the breath</span>
            </div>
          </div>

          <div className="meditation-live-controls">
            <button 
              type="button" 
              className={`voice-toggle-btn ${voiceGuideEnabled ? 'active' : ''}`}
              onClick={() => {
                const next = !voiceGuideEnabled
                setVoiceGuideEnabled(next)
                if (!next && window.speechSynthesis) window.speechSynthesis.cancel()
                if (next) speakGuide(currentPrompt)
              }}
            >
              {voiceGuideEnabled ? '🎙️ Voice Guide ON' : '🔇 Voice Guide OFF'}
            </button>
            <button type="button" className="end-early-btn" onClick={cancelSession}>
              End Session Early
            </button>
          </div>
        </div>
      )}

      {isComplete && (
        <div className="meditation-complete-card">
          <div className="complete-emoji">🌸</div>
          <h2>Meditation Complete</h2>
          <p>You gave yourself a sacred pause today. Notice how your body and mind feel right now.</p>
          <div className="badge-unlock-preview">
            <span>🏆 Calm Seeker +15 Wellness Points</span>
          </div>
          <button className="primary" onClick={() => setIsComplete(false)}>
            Return to Sanctuary
          </button>
        </div>
      )}
    </div>
  )
}
