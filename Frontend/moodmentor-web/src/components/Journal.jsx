import { useState } from 'react'
import Empty from './common/Empty'
import ActivityModal from './ActivityModal'
import { icon } from '../App'

export default function Journal({ journal, setJournal, submitJournal, analysis, busy }) {
  const [activity, setActivity] = useState(null)
  const [gratitudeMode, setGratitudeMode] = useState(false)

  return (
    <>
      <section className="journal-layout">
        <article className="panel write-panel">
          <div className="journal-mode-toggle">
            <button 
              className={`mode-btn ${!gratitudeMode ? 'active' : ''}`}
              onClick={() => setGratitudeMode(false)}
            >
              ✎ Reflection
            </button>
            <button 
              className={`mode-btn ${gratitudeMode ? 'active' : ''}`}
              onClick={() => setGratitudeMode(true)}
            >
              🙏 Gratitude
            </button>
          </div>
          
          {gratitudeMode ? (
            <>
              <p className="eyebrow">GRATITUDE JOURNAL</p>
              <h2>What are you grateful for?</h2>
              <p className="muted">Research shows gratitude journaling improves mood within 2 weeks.</p>
              <div className="gratitude-prompts">
                <span>1. Something that made you smile today</span>
                <span>2. A person you appreciate</span>
                <span>3. A small comfort you often overlook</span>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">PRIVATE REFLECTION</p>
              <h2>What is on your mind?</h2>
              <p className="muted">Write without editing yourself. This is a space just for you.</p>
            </>
          )}
          
          <form onSubmit={submitJournal}>
            <textarea 
              value={journal} 
              onChange={e => setJournal(e.target.value)} 
              maxLength="5000" 
              placeholder={gratitudeMode ? 'Today I am grateful for…' : 'Today I have been feeling…'} 
            />
            <div className="form-footer">
              <small>{journal.length} / 5000</small>
              <button className="primary" disabled={busy}>
                {busy ? 'Understanding…' : gratitudeMode ? 'Save gratitude →' : 'Understand this reflection →'}
              </button>
            </div>
          </form>
        </article>
        
        <article className="panel result-panel">
          {analysis ? (
            <>
              <div className="result-main">
                <span>{icon(analysis.dominant_emotion)}</span>
                <div>
                  <p className="eyebrow">YOU MAY BE FEELING</p>
                  <h2>{analysis.dominant_emotion}</h2>
                  <p>{Math.round(analysis.confidence * 100)}% confidence · valence {analysis.valence_score}</p>
                </div>
              </div>
              <p className="ai-reply">{analysis.ai_reply}</p>
              <h3>Small ways to support yourself</h3>
              {analysis.recommendations.map(r => (
                <div className="recommendation" key={r.id}>
                  <span>{r.activity.type === 'breathing' ? '🌬' : '✨'}</span>
                  <div>
                    <b>{r.activity.title}</b>
                    <p>{r.activity.description}</p>
                    <small>
                      {r.activity.duration_minutes} minutes · 
                      <button onClick={() => setActivity(r.activity)}>View guide →</button>
                    </small>
                  </div>
                </div>
              ))}
            </>
          ) : (
  <div className="journal-empty-state">
    <div className="journal-landscape">
      <div className="landscape-sun"></div>
      <div className="landscape-mountain mountain-back"></div>
      <div className="landscape-mountain mountain-front"></div>
      <div className="landscape-leaf leaf-left"></div>
      <div className="landscape-leaf leaf-right"></div>
    </div>

    <p>
      After you reflect, your emotional<br />
      insights and suggested next steps<br />
      will appear here.
    </p>
  </div>
)}
        </article>
      </section>
      
      {activity && <ActivityModal activity={activity} onClose={() => setActivity(null)} />}
    </>
  )
}
