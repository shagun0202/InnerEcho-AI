import { useState } from 'react'
import { api } from '../lib/api'
import { useResource } from '../lib/hooks'
import {
  Button,
  Badge,
  Dialog,
  Empty,
  ErrorState,
  Loading,
} from '../components/ui'
export default function History() {
  const journal = useResource('/journal/history?limit=200'),
    sessions = useResource('/wellness/sessions?limit=200')
  const [tab, setTab] = useState('reflections'),
    [search, setSearch] = useState(''),
    [remove, setRemove] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false)
  const resource = tab === 'reflections' ? journal : sessions
  const rows = (resource.data || []).filter((row) =>
    (row.text || row.activity?.title || '')
      .toLowerCase()
      .includes(search.toLowerCase()),
  )
  async function deleteEntry() {
    setBusy(true)
    try {
      await api(`/journal/${remove}`, { method: 'DELETE' })
      setRemove(null)
      journal.reload()
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
          <p className="eyebrow">YOUR WELLNESS TIMELINE</p>
          <h1>The moments you made space for.</h1>
          <p>Your private reflections and activity history, together.</p>
        </div>
      </div>
      <div className="history-toolbar">
        <div className="tab-row">
          {['reflections', 'activities'].map((t) => (
            <button
              key={t}
              className={tab === t ? 'active' : ''}
              aria-pressed={tab === t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          type="search"
          aria-label="Search history"
          placeholder="Search your history…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <ErrorState error={resource.error} retry={resource.reload} />
      ) : !rows.length ? (
        <Empty
          title={
            search ? 'No matching moments' : 'Your story is still unfolding'
          }
        >
          {search
            ? 'Try another word.'
            : 'Your saved reflections and sessions will appear here.'}
        </Empty>
      ) : (
        <div className="timeline">
          {rows.map((row) => (
            <article className="mm-card timeline-card" key={row.id}>
              <div className="section-title">
                <small>
                  {new Date(
                    (row.created_at || row.started_at) + 'Z',
                  ).toLocaleString()}
                </small>
                <Badge>{row.dominant_emotion || row.status}</Badge>
              </div>
              {tab === 'reflections' ? (
                <>
                  <p className="journal-excerpt">{row.text}</p>
                  <details>
                    <summary>Read reflection & suggested activities</summary>
                    <p>{row.ai_reply}</p>
                    {row.recommendations.map((r) => (
                      <div className="activity-row" key={r.id}>
                        <div>
                          <b>{r.activity.title}</b>
                          <p>{r.activity.description}</p>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={async () => {
                            try {
                              await api(`/recommendations/${r.id}/rate`, {
                                method: 'POST',
                                body: { rating: 1 },
                              })
                              setError('Feedback saved.')
                            } catch (e) {
                              setError(e.message)
                            }
                          }}
                        >
                          Helpful
                        </Button>
                      </div>
                    ))}
                  </details>
                  <button
                    className="text-button danger-text"
                    onClick={() => setRemove(row.id)}
                  >
                    Delete reflection
                  </button>
                </>
              ) : (
                <>
                  <h3>{row.activity?.title}</h3>
                  <p>
                    {Math.round(row.elapsed_seconds / 60)} minutes recorded ·
                    Before: {row.mood_before}/5
                    {row.mood_after !== null && ` → After: ${row.mood_after}/5`}
                  </p>
                  {row.mood_change !== null && (
                    <p>
                      Mood change: {row.mood_change > 0 ? '+' : ''}
                      {row.mood_change} ·{' '}
                      {row.helpful
                        ? 'You found this helpful'
                        : 'You did not find this helpful'}
                    </p>
                  )}
                </>
              )}
            </article>
          ))}
        </div>
      )}
      {error && (
        <p role="status" className="notice-inline">
          {error}
        </p>
      )}
      {remove && (
        <Dialog title="Delete this reflection?" onClose={() => setRemove(null)}>
          <p>
            This permanently removes the journal text and its analysis. Your
            separate wellness check-in and activity history remain.
          </p>
          <div className="button-row">
            <Button variant="danger" disabled={busy} onClick={deleteEntry}>
              Delete reflection
            </Button>
            <Button variant="secondary" onClick={() => setRemove(null)}>
              Keep reflection
            </Button>
          </div>
        </Dialog>
      )}
    </>
  )
}
