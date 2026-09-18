import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useResource } from '../lib/hooks'
import { api } from '../lib/api'
import {
  Badge,
  Button,
  Empty,
  ErrorState,
  Icon,
  Loading,
  SectionTitle,
} from '../components/ui'
export default function Insights() {
  const resource = useResource('/wellness/summary'),
    balance = useResource('/team/work-life-score')
  const [report, setReport] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  if (resource.loading) return <Loading />
  if (resource.error)
    return <ErrorState error={resource.error} retry={resource.reload} />
  const data = resource.data
  async function weekly() {
    setBusy(true)
    setError('')
    try {
      setReport(await api('/report/weekly'))
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
          <p className="eyebrow">PATTERNS INTO PRACTICE</p>
          <h1>Learn what makes a difference.</h1>
          <p>
            Your own check-ins and activity outcomes. No comparisons with anyone
            else.
          </p>
        </div>
        <Button variant="secondary" disabled={busy} onClick={weekly}>
          {busy ? 'Preparing…' : 'Open weekly reflection'}
        </Button>
      </div>
      <div className="insight-banner">
        <Icon name="spark" size={28} />
        <div>
          <h3>One observation to take with you</h3>
          <p>{data.insights[0]}</p>
        </div>
      </div>
      <div className="insights-grid">
        <article className="mm-card">
          <SectionTitle eyebrow="LAST 30 DAYS" title="Your check-in rhythm">
            <Badge>Self-reported mood</Badge>
          </SectionTitle>
          {data.mood_trend.length ? (
            <>
              <div className="mood-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.mood_trend}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => d.slice(5)}
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--muted)"
                    />
                    <YAxis
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      width={25}
                      axisLine={false}
                      tickLine={false}
                      stroke="var(--muted)"
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                      }}
                    />
                    <Area
                      dataKey="mood"
                      type="monotone"
                      stroke="#537d68"
                      fill="#87a98f"
                      fillOpacity={0.15}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <details>
                <summary>View chart data as a table</summary>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Average mood / 5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.mood_trend.map((r) => (
                      <tr key={r.date}>
                        <td>{r.date}</td>
                        <td>{r.mood}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          ) : (
            <Empty title="A rhythm will emerge">
              Your command-center check-ins build this chart over time.
            </Empty>
          )}
        </article>
        <article className="mm-card">
          <SectionTitle
            eyebrow="ACTIVITY OUTCOMES"
            title="What seems to help"
          />
          {data.effectiveness.length ? (
            <div className="effectiveness-list">
              {data.effectiveness.map((g) => (
                <div key={g.type}>
                  <div className="section-title">
                    <b>{g.type}</b>
                    <Badge tone={g.average_change > 0 ? 'sage' : ''}>
                      {g.average_change > 0 ? '+' : ''}
                      {g.average_change} mood
                    </Badge>
                  </div>
                  <progress value={g.helpful_percent} max={100} />
                  <small>
                    {g.sessions} completed · {g.helpful_percent}% marked helpful
                    {g.sessions < 3 ? ' · Early signal' : ''}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <Empty title="Let experience guide you">
              Complete a session and its before/after check-in to begin.
            </Empty>
          )}
          <p className="quiet-note">
            Mood change is an observation on a 1–5 scale, not a medical result
            or proof an activity caused the change.
          </p>
        </article>
      </div>
      <div className="insights-grid">
        <article className="mm-card">
          <SectionTitle title="Emotional signals" />
          {Object.keys(data.emotion_distribution).length ? (
            Object.entries(data.emotion_distribution).map(([name, count]) => (
              <div className="distribution-row" key={name}>
                <span>{name}</span>
                <span className="distribution-track">
                  <i
                    style={{
                      width: `${(count / Math.max(...Object.values(data.emotion_distribution))) * 100}%`,
                    }}
                  />
                </span>
                <b>{count}</b>
              </div>
            ))
          ) : (
            <Empty title="No signals recorded yet">
              Text-based check-ins will appear here.
            </Empty>
          )}
        </article>
        <article className="mm-card">
          <SectionTitle title="Your personal milestones" />
          {data.milestones.map((m) => (
            <div
              className={`milestone ${m.unlocked ? 'unlocked' : ''}`}
              key={m.title}
            >
              <span className="small-icon">
                <Icon name={m.unlocked ? 'check' : 'leaf'} />
              </span>
              <div>
                <b>{m.title}</b>
                <small>
                  {m.unlocked ? 'A moment worth noticing' : 'At your own pace'}
                </small>
              </div>
            </div>
          ))}
          <p className="quiet-note">
            Streaks encourage consistency, never pressure. Rest days are part of
            wellbeing.
          </p>
        </article>
      </div>
      {balance.data?.journal_regularity > 0 && (
        <article className="mm-card">
          <SectionTitle title="Your workday reflection pattern" />
          <p>{balance.data.tip}</p>
          <p>
            {balance.data.journal_regularity}% of days included a journal entry
            over the last 30 days.
          </p>
          <p className="quiet-note">
            This describes how often you use the journal. It does not measure
            productivity, mental health, or burnout.
          </p>
        </article>
      )}
      {error && (
        <p role="alert" className="inline-error">
          {error}
        </p>
      )}
      {report && (
        <article className="mm-card weekly-report">
          <Badge>Weekly reflection</Badge>
          <h2>
            {report.week_start} — {report.week_end}
          </h2>
          {report.total_entries === 0 ? (
            <Empty title="Your week is a fresh page">
              Add a journal reflection to begin a weekly summary.
            </Empty>
          ) : (
            <>
              <p>{report.narrative}</p>
              <ul>
                {report.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <p>
                <b>One next step:</b> {report.suggestion}
              </p>
            </>
          )}
        </article>
      )}
    </>
  )
}
