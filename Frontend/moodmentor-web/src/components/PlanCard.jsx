import { useState } from 'react'
import { api } from '../lib/api'
import { Button, Icon, Badge } from './ui'

export default function PlanCard({ plan, onPlan, onStart, onSafety, onDismiss }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  async function change(action) {
    setBusy(true)
    setError('')
    try {
      const result = await api(`/wellness/plans/${plan.id}/${action}`, {
        method: 'POST',
      })
      onPlan?.(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  if (!plan) return null
  const activity = plan.activity
  return (
    <article className={`plan-card ${activity ? '' : 'support-card'}`}>
      <div className="plan-eyebrow">
        <Icon name={activity ? 'spark' : 'shield'} />
        <span>
          {activity ? 'YOUR BEST NEXT STEP' : 'MAKE ROOM FOR HUMAN SUPPORT'}
        </span>
        <Badge>{activity ? 'Personalized plan' : 'Support available'}</Badge>
      </div>
      <h2>{activity?.title || 'You don’t have to carry this alone.'}</h2>
      <p>{plan.rationale}</p>
      {activity && (
        <div className="inline-meta">
          <span>
            <Icon name="clock" size={15} />
            {activity.minutes} minutes
          </span>
          <span>{activity.category}</span>
          <span>{activity.level}</span>
        </div>
      )}
      <div className="button-row">
        {activity ? (
          <>
            <Button
              disabled={busy || plan.status !== 'suggested'}
              onClick={() => onStart(activity, plan.id)}
            >
              <Icon name="play" size={17} />
              Start reset
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => change('change')}
            >
              Change
            </Button>
            <button
              className="text-button"
              disabled={busy}
              onClick={() => {
                if (onDismiss) onDismiss();
                else change('dismiss');
              }}
            >
              Not now
            </button>
          </>
        ) : (
          <Button onClick={() => onSafety(plan.safety)}>
            View support options
          </Button>
        )}
      </div>
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      <details className="agent-trace">
        <summary>How this recommendation was made</summary>
        <ol>
          {plan.trace.map((step, i) => (
            <li key={i}>
              <b>{step.stage}</b>
              <span>{step.detail}</span>
            </li>
          ))}
        </ol>
      </details>
    </article>
  )
}
