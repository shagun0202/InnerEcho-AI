import { useState } from 'react'
import { api } from '../lib/api'
import { useResource } from '../lib/hooks'
import {
  Badge,
  Button,
  Empty,
  ErrorState,
  Icon,
  Loading,
  SectionTitle,
} from '../components/ui'
function TeamSpace({ team }) {
  const moods = useResource('/team/mood/summary'),
    kudos = useResource('/team/kudos'),
    challenge = useResource('/team/challenge')
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('')
  async function share(mood) {
    setBusy(true)
    setError('')
    try {
      await api('/team/mood', { method: 'POST', body: { mood } })
      moods.reload()
      challenge.reload()
      setNotice('Your optional team check-in is saved.')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  async function appreciate(e) {
    e.preventDefault()
    const form = e.currentTarget
    setBusy(true)
    setError('')
    try {
      await api('/team/kudos', {
        method: 'POST',
        body: Object.fromEntries(new FormData(form)),
      })
      form.reset()
      kudos.reload()
      setNotice('Your appreciation is shared with the team.')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <article className="mm-card team-header">
        <span className="small-icon">
          <Icon name="team" />
        </span>
        <div>
          <h2>{team.name}</h2>
          <p>{team.members} members · Participation is always optional</p>
        </div>
        {team.invite_code && (
          <details>
            <summary>Invite a teammate</summary>
            <p>
              Share this code privately. Anyone with it can join this workspace.
            </p>
            <code className="invite-code">{team.invite_code}</code>
          </details>
        )}
      </article>
      <div className="insights-grid">
        <article className="mm-card">
          <SectionTitle title="A shared sense of the week" />
          {moods.loading ? (
            <Loading />
          ) : moods.error ? (
            <ErrorState error={moods.error} retry={moods.reload} />
          ) : (
            <>
              {moods.data.visible ? (
                <>
                  <p>
                    {moods.data.total_submissions} opt-in check-ins this week
                  </p>
                  {Object.entries(moods.data.mood_counts).map(
                    ([name, count]) => (
                      <div className="distribution-row" key={name}>
                        <span>{name}</span>
                        <span className="distribution-track">
                          <i
                            style={{
                              width: `${(count / moods.data.total_submissions) * 100}%`,
                            }}
                          />
                        </span>
                        <b>{count}</b>
                      </div>
                    ),
                  )}
                </>
              ) : (
                <Empty title="Privacy comes before a chart">
                  Team patterns appear after at least{' '}
                  {moods.data.minimum_sample} distinct members share a check-in.
                  Individual moods are never shown.
                </Empty>
              )}
              <fieldset>
                <legend>Share a mood with your team</legend>
                <p className="quiet-note">
                  This is separate from your private check-ins. Only the
                  aggregate becomes visible.
                </p>
                <div className="filter-chips">
                  {['great', 'good', 'okay', 'rough', 'struggling'].map((m) => (
                    <button
                      key={m}
                      disabled={busy || moods.data.submitted_today}
                      onClick={() => share(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {moods.data.submitted_today && (
                  <p className="success-note">You’ve shared a mood today.</p>
                )}
              </fieldset>
            </>
          )}
        </article>
        <article className="mm-card">
          <Badge>OPTIONAL TEAM CAMPAIGN</Badge>
          <h2>{challenge.data?.title || 'Make room for a pause'}</h2>
          <p>
            {challenge.data?.description ||
              'Take a small break, then choose whether to share a team check-in.'}
          </p>
          {challenge.data?.visible ? (
            <>
              <div className="goal-number">
                {challenge.data.progress}
                <span> / {challenge.data.goal} check-ins</span>
              </div>
              <progress
                max={challenge.data.goal}
                value={challenge.data.progress}
              />
            </>
          ) : (
            <p className="quiet-note">
              Campaign progress is hidden until enough distinct members
              participate. Private activity completion never feeds team
              statistics.
            </p>
          )}
        </article>
      </div>
      <div className="insights-grid">
        <article className="mm-card">
          <SectionTitle title="A little appreciation goes a long way" />
          <form onSubmit={appreciate}>
            <label>
              Who would you like to thank?
              <input
                name="recipient_name"
                required
                minLength={2}
                maxLength={100}
                placeholder="Teammate’s name"
              />
            </label>
            <label>
              Your message
              <textarea
                name="message"
                required
                minLength={3}
                maxLength={300}
                rows={3}
                placeholder="Thank you for…"
              />
            </label>
            <p className="quiet-note">
              Your name and this message will be visible to your team.
            </p>
            <Button disabled={busy}>
              Share appreciation
              <Icon name="arrow" size={16} />
            </Button>
          </form>
        </article>
        <article className="mm-card">
          <SectionTitle title="The kudos wall" />
          {kudos.loading ? (
            <Loading />
          ) : kudos.error ? (
            <ErrorState error={kudos.error} retry={kudos.reload} />
          ) : kudos.data.length ? (
            kudos.data.map((k) => (
              <div className="kudos-note" key={k.id}>
                <small>
                  {k.sender_name} → {k.recipient_name}
                </small>
                <p>{k.message}</p>
              </div>
            ))
          ) : (
            <Empty title="Make someone’s day">
              The first note of appreciation can start here.
            </Empty>
          )}
        </article>
      </div>
      {error && (
        <p role="alert" className="inline-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="notice-inline">
          {notice}
        </p>
      )}
    </>
  )
}
export default function Team() {
  const resource = useResource('/team/workspace'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false)
  async function submit(e, path) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      resource.setData(
        await api(path, {
          method: 'POST',
          body: Object.fromEntries(new FormData(e.currentTarget)),
        }),
      )
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
          <p className="eyebrow">BETTER WORKDAYS, TOGETHER</p>
          <h1>A culture of small kindnesses.</h1>
          <p>
            Optional check-ins and appreciation, with room for everyone’s
            privacy.
          </p>
        </div>
        <Badge>
          <Icon name="shield" size={14} />
          Privacy-aware
        </Badge>
      </div>
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <ErrorState error={resource.error} retry={resource.reload} />
      ) : resource.data ? (
        <TeamSpace team={resource.data} />
      ) : (
        <div className="insights-grid">
          <article className="mm-card">
            <Icon name="team" size={32} />
            <h2>Create a team space</h2>
            <p>
              Start a private workspace and invite colleagues with a secure
              code.
            </p>
            <form onSubmit={(e) => submit(e, '/team/workspace')}>
              <label>
                Team name
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Your team or workspace"
                />
              </label>
              <Button disabled={busy}>Create team</Button>
            </form>
          </article>
          <article className="mm-card">
            <h2>Already invited?</h2>
            <p>Ask your team owner for their invitation code.</p>
            <form onSubmit={(e) => submit(e, '/team/join')}>
              <label>
                Invite code
                <input
                  name="code"
                  required
                  minLength={12}
                  maxLength={50}
                  autoComplete="off"
                  placeholder="Paste your private invite code"
                />
              </label>
              <Button variant="secondary" disabled={busy}>
                Join team
              </Button>
            </form>
          </article>
        </div>
      )}
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      <p className="page-footnote">
        <Icon name="shield" size={15} />
        Your private journals, chat, activity outcomes, and check-in text never
        appear in the team space.
      </p>
    </>
  )
}
