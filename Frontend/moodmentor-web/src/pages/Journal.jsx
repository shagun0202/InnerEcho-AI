import { useState } from 'react'
import { api } from '../lib/api'
import { Button, Badge, Icon, Empty } from '../components/ui'
import PlanCard from '../components/PlanCard'
export default function Journal({ onStart, onSafety }) {
  const [text, setText] = useState(''),
    [entry, setEntry] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const [prompt, setPrompt] = useState('reflection')
  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await api('/journal', { method: 'POST', body: { text } })
      setEntry(result)
      setText('')
      if (result.wellness_plan?.safety.action_required)
        onSafety(result.wellness_plan.safety)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">YOUR PRIVATE JOURNAL</p>
          <h1>A little clarity starts here.</h1>
          <p>No perfect words needed. Just a moment to hear yourself.</p>
        </div>
        <Badge>
          <Icon name="shield" size={13} />
          Only you
        </Badge>
      </div>
      <div className="journal-grid">
        <form className="mm-card writing-card" onSubmit={submit}>
          <div className="tab-row">
            {['reflection', 'gratitude'].map((p) => (
              <button
                type="button"
                className={prompt === p ? 'active' : ''}
                aria-pressed={prompt === p}
                onClick={() => setPrompt(p)}
                key={p}
              >
                {p === 'reflection'
                  ? 'Open reflection'
                  : 'A moment of gratitude'}
              </button>
            ))}
          </div>
          <h2>
            {prompt === 'reflection'
              ? 'What’s taking up space in your mind?'
              : 'What’s one small thing you appreciated?'}
          </h2>
          <label className="sr-only" htmlFor="journal-text">
            Journal entry
          </label>
          <textarea
            id="journal-text"
            required
            minLength={3}
            maxLength={5000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              prompt === 'reflection'
                ? 'Today I noticed…'
                : 'Something I appreciated today was…'
            }
          />
          <div className="checkin-footer">
            <small>{text.length} / 5,000</small>
            <Button disabled={busy || text.trim().length < 3}>
              {busy ? 'Reflecting…' : 'Save & reflect'}
              <Icon name="arrow" size={16} />
            </Button>
          </div>
          {error && (
            <p role="alert" className="inline-error">
              {error}
            </p>
          )}
          <p className="quiet-note">
            Saving creates a private journal entry and a suggested wellness
            plan. Gemini receives text only if you enable AI sharing in
            Settings.
          </p>
        </form>
        <aside className="journal-aside">
          <div className="mm-card">
            <Icon name="leaf" size={28} />
            <h3>A few gentle starting points</h3>
            <p>What gave you energy today?</p>
            <p>What felt heavier than expected?</p>
            <p>What could you give yourself permission to set down?</p>
          </div>
          <p className="quiet-note">
            Emotional signals can miss context. Your own understanding of how
            you feel comes first.
          </p>
        </aside>
      </div>
      {entry ? (
        <section className="reflection-result">
          <div className="mm-card">
            <Badge tone="sage">Reflection saved</Badge>
            <h2>Here’s what came through.</h2>
            <div className="emotion-tags">
              {Object.entries(entry.emotions)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([emotion]) => (
                  <Badge key={emotion}>{emotion}</Badge>
                ))}
            </div>
            <p className="reflection-copy">{entry.ai_reply}</p>
            <p className="quiet-note">
              Signal method: {entry.analysis_method.replaceAll('_', ' ')}.
              Signals are not a diagnosis or a measure of certainty.
            </p>
          </div>
          <PlanCard
            plan={entry.wellness_plan}
            onPlan={(plan) => setEntry({ ...entry, wellness_plan: plan })}
            onStart={onStart}
            onSafety={onSafety}
          />
        </section>
      ) : (
        <Empty title="Your words can lead to a small next step">
          After saving, you’ll see a reflection and a wellness activity you can
          choose to try.
        </Empty>
      )}
    </>
  )
}
