import { useState } from 'react'
import { api } from '../lib/api'
import { useResource, navigate } from '../lib/hooks'
import {
  Badge,
  Button,
  Empty,
  ErrorState,
  Icon,
  Landscape,
  Loading,
  MoodPicker,
  SectionTitle,
} from '../components/ui'
import PlanCard from '../components/PlanCard'

export function CommandCenter({ onStart, onSafety, rescue = false, onUpdate }) {
  const [mood, setMood] = useState(3),
    [energy, setEnergy] = useState(3),
    [stress, setStress] = useState(3)
  const [text, setText] = useState(''),
    [context, setContext] = useState('general'),
    [minutes, setMinutes] = useState(5)
  const [plan, setPlan] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const choices = [
    ['overwhelmed', 'I feel overwhelmed'],
    ['motivation', 'I need motivation'],
    ['focus', 'I need focus'],
    ['break', 'I need a break'],
    ['connection', 'I need to talk'],
    ['meetings', 'I need to calm down'],
  ]
  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await api('/wellness/checkins', {
        method: 'POST',
        body: {
          text,
          mood,
          energy,
          stress,
          context,
          minutes,
          source: rescue ? 'rescue' : 'command',
        },
      })
      setPlan(result)
      onUpdate?.()
      if (result.safety.action_required) onSafety(result.safety)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="command-center">
      <form className="mm-card checkin-card" onSubmit={submit}>
        <div className="section-title">
          <div>
            <p className="eyebrow">
              {rescue ? 'MOOD RESCUE' : 'AI WELLNESS COMMAND CENTER'}
            </p>
            <h2>
              {rescue
                ? 'Let’s make this moment easier.'
                : 'How are you arriving today?'}
            </h2>
          </div>
          <span className="small-icon">
            <Icon name="spark" />
          </span>
        </div>
        <p className="muted">
          {rescue
            ? 'Choose what you need. We’ll find a small, practical reset.'
            : 'A quick check-in helps us suggest a next step that fits your day.'}
        </p>
        {rescue && (
          <div className="rescue-options">
            {choices.map(([key, label]) => (
              <button
                type="button"
                key={key}
                className={context === key ? 'selected' : ''}
                aria-pressed={context === key}
                onClick={() => setContext(key)}
              >
                {label}
                <Icon name="arrow" size={15} />
              </button>
            ))}
          </div>
        )}
        <MoodPicker value={mood} onChange={setMood} />
        <div className="form-grid">
          <label>
            Energy <span className="range-value">{energy}/5</span>
            <input
              type="range"
              min="1"
              max="5"
              value={energy}
              onChange={(e) => setEnergy(+e.target.value)}
            />
            <span className="range-labels">
              <small>Low</small>
              <small>High</small>
            </span>
          </label>
          <label>
            Stress <span className="range-value">{stress}/5</span>
            <input
              type="range"
              min="1"
              max="5"
              value={stress}
              onChange={(e) => setStress(+e.target.value)}
            />
            <span className="range-labels">
              <small>Low</small>
              <small>High</small>
            </span>
          </label>
        </div>
        <label className="sr-only" htmlFor="checkin-text">
          What is on your mind?
        </label>
        <textarea
          id="checkin-text"
          rows={2}
          maxLength={5000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Anything on your mind? A few words are enough. (Optional)"
        />
        <div className="checkin-footer">
          <label className="inline-label">
            <Icon name="clock" size={16} />
            <select
              aria-label="Available time"
              value={minutes}
              onChange={(e) => setMinutes(+e.target.value)}
            >
              {(rescue ? [2, 3, 5] : [2, 3, 5, 10, 15, 20]).map((n) => (
                <option key={n} value={n}>
                  {n} minutes available
                </option>
              ))}
            </select>
          </label>
          <Button disabled={busy}>
            {busy ? 'Finding your next step…' : 'Find my next step'}
            <Icon name="arrow" size={16} />
          </Button>
        </div>
        {error && (
          <p role="alert" className="inline-error">
            {error}
          </p>
        )}
        <p className="quiet-note">
          <Icon name="shield" size={13} />
          Only your structured check-in is saved here. Optional text helps this
          recommendation.
        </p>
      </form>
      {plan && (
        <PlanCard
          plan={plan}
          onPlan={setPlan}
          onStart={onStart}
          onSafety={onSafety}
        />
      )}
    </div>
  )
}

export default function Dashboard({ user, onStart, onSafety }) {
  const resource = useResource('/wellness/summary')
  if (resource.loading && !resource.data) return <Loading />
  if (resource.error)
    return <ErrorState error={resource.error} retry={resource.reload} />
  const data = resource.data
  const hour = new Date().getHours()
  return (
    <>
      <section className="page-intro">
        <div>
          <span className="eyebrow">YOUR WELLBEING, ONE MOMENT AT A TIME</span>
          <h1>
            Good {hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'},{' '}
            {user.name.split(' ')[0]} <span className="greeting-sun">☀</span>
          </h1>
          <p>Take a breath. Let’s find a little balance in your day.</p>
        </div>
        <span className="date-label">
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </section>
      <div className="dashboard-top">
        <div className="welcome-banner">
          <div>
            <Badge>A MOMENT FOR YOU</Badge>
            <h2>
              You don’t need a better day
              <br />
              to take a better break.
            </h2>
            <p>A small reset can be a good place to start.</p>
            <Button variant="light" onClick={() => navigate('wellness')}>
              Find your reset <Icon name="arrow" size={17} />
            </Button>
          </div>
          <Landscape />
        </div>
        <article className="mm-card weekly-goal">
          <span className="small-icon">
            <Icon name="leaf" />
          </span>
          <p className="eyebrow">YOUR WEEKLY INTENTION</p>
          <h3>Make space for yourself</h3>
          <div className="goal-number">
            {data.weekly_sessions}
            <span> / {data.weekly_goal} sessions</span>
          </div>
          <progress max={data.weekly_goal} value={data.weekly_sessions} />
          <p>
            {data.weekly_sessions >= data.weekly_goal
              ? 'You made room for your weekly intention.'
              : 'Small moments count. There’s no need to catch up.'}
          </p>
        </article>
      </div>
      <section className="metric-row">
        {[
          [data.streak, 'Day activity streak', 'history'],
          [data.total_sessions, 'Sessions completed', 'check'],
          [data.total_minutes, 'Mindful minutes', 'clock'],
          [data.meditation_sessions, 'Meditation sessions', 'meditation'],
        ].map(([value, label, icon]) => (
          <article key={label}>
            <span className="metric-icon">
              <Icon name={icon} />
            </span>
            <div>
              <b>{value}</b>
              <span>{label}</span>
            </div>
          </article>
        ))}
      </section>
      {data.active_sessions.length > 0 && (
        <div className="resume-banner">
          <Icon name="play" />
          <div>
            <b>A moment you can return to</b>
            <p>
              {data.active_sessions[0].activity.title} · Your progress is saved.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => onStart(null, null, data.active_sessions[0])}
          >
            Continue session
          </Button>
        </div>
      )}
      <CommandCenter
        onStart={onStart}
        onSafety={onSafety}
        onUpdate={resource.reload}
      />
      <section className="dashboard-bottom">
        <article className="mm-card">
          <SectionTitle
            eyebrow="YOUR PERSONAL PATTERNS"
            title="A little insight, a useful next step"
          >
            <button
              className="text-button"
              onClick={() => navigate('insights')}
            >
              View insights <Icon name="arrow" size={15} />
            </button>
          </SectionTitle>
          <div className="insight-note">
            <Icon name="spark" />
            <p>{data.insights[0]}</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('meditation')}>
            Explore a mindful pause
          </Button>
        </article>
        <article className="mm-card">
          <SectionTitle eyebrow="MAKING ROOM" title="Recent moments" />
          {data.recent_sessions.length ? (
            data.recent_sessions.slice(0, 3).map((s) => (
              <div className="activity-row" key={s.id}>
                <span className="small-icon">
                  <Icon name="meditation" />
                </span>
                <div>
                  <b>{s.activity.title}</b>
                  <small>
                    {s.activity.minutes} min ·{' '}
                    {new Date(s.completed_at + 'Z').toLocaleDateString()}
                  </small>
                </div>
                <Badge tone={s.mood_change > 0 ? 'sage' : ''}>
                  {s.mood_change > 0 ? '+' : ''}
                  {s.mood_change} mood
                </Badge>
              </div>
            ))
          ) : (
            <Empty title="Your first pause is waiting">
              Completed activities will appear here, along with how you felt
              afterwards.
            </Empty>
          )}
        </article>
      </section>
      <p className="page-footnote">
        <Icon name="shield" size={14} />
        Your check-ins are private. Your employer cannot see your journal or
        individual wellness history.
      </p>
    </>
  )
}
