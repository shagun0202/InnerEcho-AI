import { useState } from 'react'
import { request } from '../api'
import { emotions, icon } from '../App'

export default function QuickMoodCheckIn({ token }) {
  const [selectedMood, setSelectedMood] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedMood) return
    
    setBusy(true)
    setError('')
    
    try {
      await request('/mood/quick', { 
        method: 'POST', 
        token, 
        body: { mood: selectedMood, note } 
      })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setSelectedMood('')
        setNote('')
      }, 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (success) {
    return (
      <article className="panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
        <h3>Check-in saved</h3>
        <p className="muted">Thank you for taking a moment to pause.</p>
      </article>
    )
  }

  return (
    <article className="panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="panel-head" style={{ marginBottom: '2rem' }}>
        <div>
          <p className="eyebrow">QUICK CHECK-IN</p>
          <h3>How are you feeling right now?</h3>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          {Object.entries(emotions).map(([mood, [emoji, color]]) => (
            <button
              key={mood}
              type="button"
              onClick={() => setSelectedMood(mood)}
              style={{
                fontSize: '2rem',
                padding: '1rem',
                border: `2px solid ${selectedMood === mood ? color : 'transparent'}`,
                borderRadius: '50%',
                background: selectedMood === mood ? `${color}20` : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: selectedMood === mood ? 'scale(1.1)' : 'scale(1)'
              }}
              title={mood}
            >
              {emoji}
            </button>
          ))}
        </div>
        
        {selectedMood && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <b>{selectedMood}</b>
          </div>
        )}
        
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a quick note (optional)"
            maxLength={100}
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}
          />
        </div>
        
        {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}
        
        <button 
          className="primary full" 
          disabled={!selectedMood || busy}
          style={{ padding: '1rem' }}
        >
          {busy ? 'Saving...' : 'Save check-in'}
        </button>
      </form>
    </article>
  )
}
