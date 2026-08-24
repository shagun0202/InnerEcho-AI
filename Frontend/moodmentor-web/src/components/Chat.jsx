import { useEffect, useRef, useState } from 'react'
import { icon } from '../App'

export default function Chat({ chat, chatText, setChatText, sendChat, busy }) {
  const logRef = useRef(null)
  const recognitionRef = useRef(null)
  const [isListening, setIsListening] = useState(false)
  const [speakingId, setSpeakingId] = useState(null)
  const [voiceSupported, setVoiceSupported] = useState(true)

  const baseTextRef = useRef('')

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [chat])

  // Initialize Web Speech API for Microphone input
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i]
        if (item.isFinal) {
          finalTranscript += item[0].transcript + ' '
        } else {
          interimTranscript += item[0].transcript
        }
      }

      const spoken = (finalTranscript + interimTranscript).trim()
      const base = baseTextRef.current.trim()
      setChatText(base ? `${base} ${spoken}` : spoken)
    }

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      try { recognition.stop() } catch {}
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [setChatText])

  const toggleListening = () => {
    if (!voiceSupported) {
      alert('Voice speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.')
      return
    }

    if (isListening) {
      try { recognitionRef.current?.stop() } catch {}
      setIsListening(false)
    } else {
      baseTextRef.current = chatText
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (err) {
        console.error('Recognition start failed:', err)
        setIsListening(false)
      }
    }
  }

  const speakMessage = (id, text) => {
    if (!window.speechSynthesis) return

    if (speakingId === id) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.05

    // Select a friendly English voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Female')))
    if (preferredVoice) utterance.voice = preferredVoice

    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)

    setSpeakingId(id)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <article className="panel chat-panel">
      <div className="chat-log" ref={logRef}>
        {chat.length ? (
          chat.map(message => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-header">
                <p>{message.text}</p>
                {message.role === 'assistant' && (
                  <button 
                    type="button"
                    className={`tts-btn ${speakingId === message.id ? 'speaking' : ''}`}
                    onClick={() => speakMessage(message.id, message.text)}
                    title={speakingId === message.id ? 'Stop listening' : 'Listen to reply'}
                    aria-label="Read aloud"
                  >
                    {speakingId === message.id ? '⏹ Stop' : '🔊 Listen'}
                  </button>
                )}
              </div>
              {message.emotion && <small>{icon(message.emotion)} detected: {message.emotion}</small>}
            </div>
          ))
        ) : (
          <div className="chat-welcome">
            <span className="welcome-avatar">🎙️</span>
            <h2>Talk With Me</h2>
            <p>Speak or write anything that is on your mind. I am here to listen without judgment.</p>
            <div className="voice-hint-badge">
              <span>💡 Tip: Click the microphone 🎙️ to talk hands-free</span>
            </div>
          </div>
        )}
      </div>

      {isListening && (
        <div className="listening-indicator-bar">
          <span className="pulse-mic-dot"></span>
          <b>Listening to your voice...</b> (speak naturally or click stop when finished)
          <button type="button" className="stop-mic-btn" onClick={toggleListening}>Done Speaking ✓</button>
        </div>
      )}

      <form className="chat-form" onSubmit={(e) => {
        if (isListening) {
          recognitionRef.current?.stop()
          setIsListening(false)
        }
        sendChat(e)
      }}>
        <button
          type="button"
          className={`mic-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          title={isListening ? 'Stop voice recording' : 'Speak with microphone'}
          aria-label="Voice input"
        >
          {isListening ? '🔴' : '🎙️'}
        </button>
        <input 
          value={chatText} 
          onChange={e => setChatText(e.target.value)} 
          placeholder={isListening ? 'Listening to your voice…' : 'Type or tap 🎙️ to talk freely…'} 
        />
        <button className="primary" disabled={busy || (!chatText.trim() && !isListening)}>
          {busy ? 'Thinking…' : 'Send'}
        </button>
      </form>
    </article>
  )
}
