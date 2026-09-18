import { useState } from 'react'
import { api } from '../lib/api'
import { useResource, navigate } from '../lib/hooks'
import {
  Badge,
  Button,
  Empty,
  ErrorState,
  Icon,
  Loading,
  SectionTitle,
} from '../components/ui'
import { CommandCenter } from './Dashboard'
import { ActivityArtwork, WellnessPhoto } from '../components/WellnessVisual'
export default function Library({
  meditation = false,
  embedded = false,
  onStart,
  onSafety,
}) {
  const catalog = useResource('/wellness/catalog'),
    profile = useResource('/wellness/profile'),
    summary = useResource('/wellness/summary')
  const [category, setCategory] = useState('All'),
    [duration, setDuration] = useState('All'),
    [favorites, setFavorites] = useState(false),
    [error, setError] = useState(''),
    [saving, setSaving] = useState(false)
  if (catalog.loading || profile.loading || summary.loading) return <Loading />
  const failed = [catalog, profile, summary].find((r) => r.error)
  if (failed)
    return (
      <ErrorState
        error={failed.error}
        retry={() => {
          catalog.reload()
          profile.reload()
          summary.reload()
        }}
      />
    )
  const base = catalog.data.filter(
    (a) =>
      !meditation || ['meditation', 'breathing', 'grounding'].includes(a.type),
  )
  const items = base.filter(
    (a) =>
      (category === 'All' ||
        a.category === category ||
        a.tags.includes(category.toLowerCase())) &&
      (duration === 'All' || a.minutes === +duration) &&
      (!favorites || profile.data.favorites.includes(a.id)),
  )
  const latest = summary.data.latest_plan?.activity
  const recommended =
    latest &&
    (!meditation ||
      ['meditation', 'breathing', 'grounding'].includes(latest.type))
      ? latest
      : null
  async function favorite(key) {
    setSaving(true)
    setError('')
    const list = profile.data.favorites.includes(key)
      ? profile.data.favorites.filter((k) => k !== key)
      : [...profile.data.favorites, key]
    try {
      profile.setData(
        await api('/wellness/profile', {
          method: 'PUT',
          body: { ...profile.data, favorites: list },
        }),
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }
  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">
            {meditation ? 'THE MEDITATION ROOM' : 'YOUR WELLNESS TOOLKIT'}
          </p>
          <h1>
            {meditation
              ? 'A softer pace starts here.'
              : 'Small actions. More balance.'}
          </h1>
          <p>
            {meditation
              ? 'Make space for calm, focus, or simply a moment to yourself.'
              : 'Find a practical reset for your mind, body, and workday.'}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('history')}>
          Session history
          <Icon name="history" size={16} />
        </Button>
      </div>
      {!meditation && !embedded && (
        <CommandCenter
          rescue
          onStart={onStart}
          onSafety={onSafety}
          onUpdate={summary.reload}
        />
      )}
      <section className={`library-hero ${meditation ? 'lavender' : 'sage'}`}>
        <div>
          <Badge>
            {recommended ? 'FROM YOUR LATEST CHECK-IN' : 'START WHERE YOU ARE'}
          </Badge>
          <h2>
            {recommended
              ? recommended.title
              : meditation
                ? 'The quiet between tasks'
                : 'A little room to breathe'}
          </h2>
          <p>
            {meditation
              ? 'A gentle return to the present. No experience needed.'
              : 'A short pause, a calmer next step. Choose what feels right.'}
          </p>
          <Button
            variant="light"
            onClick={() =>
              onStart(
                recommended
                  ? recommended
                  : catalog.data.find(
                      (a) =>
                        a.id === (meditation ? 'meditation-5' : 'breathing-3'),
                    ),
              )
            }
          >
            Begin a reset
            <Icon name="play" size={16} />
          </Button>
        </div>
        <WellnessPhoto
          scene={meditation ? 'calm' : 'connect'}
          className="library-hero-photo"
        />
      </section>
      {summary.data.active_sessions.map((s) => (
        <div key={s.id} className="resume-banner">
          <Icon name="clock" />
          <div>
            <b>Continue {s.activity.title}</b>
            <p>{Math.floor(s.elapsed_seconds / 60)} minutes already recorded</p>
          </div>
          <Button variant="secondary" onClick={() => onStart(null, null, s)}>
            Resume
          </Button>
        </div>
      ))}
      {meditation && (
        <div className="metric-grid">
          <article className="metric-card">
            <span>Meditation streak</span>
            <strong>
              {summary.data.meditation_streak || 0}
              <small> days</small>
            </strong>
            <p>Based on completed meditation sessions</p>
          </article>
          <article className="metric-card">
            <span>Saved for later</span>
            <strong>
              {base.filter((a) => profile.data.favorites.includes(a.id)).length}
              <small> favorites</small>
            </strong>
            <p>Your meditation, breathing and grounding picks</p>
          </article>
        </div>
      )}
      <SectionTitle
        eyebrow="CURATED MOMENTS"
        title={meditation ? 'Find your kind of quiet' : 'Choose a way to reset'}
      >
        <button
          className="text-button"
          aria-pressed={favorites}
          onClick={() => setFavorites(!favorites)}
        >
          {favorites ? 'Show all' : '♡ My favorites'}
        </button>
      </SectionTitle>
      <div className="library-filters">
        <div className="filter-chips">
          {(meditation
            ? ['All', 'Calm', 'Focus', 'Sleep', 'Relaxation']
            : [
                'All',
                'Mind',
                'Body',
                'Focus',
                'Social',
                'Environment',
                'Recovery',
              ]
          ).map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              className={category === c ? 'selected' : ''}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          aria-label="Session duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        >
          <option>All</option>
          {[2, 3, 5, 10, 15, 20].map((n) => (
            <option key={n} value={n}>
              {n} minutes
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="inline-error">
          {error}
        </p>
      )}
      {items.length ? (
        <div className="activity-grid">
          {items.map((a) => (
            <article className="library-card" key={a.id}>
              <div className="library-art">
                <ActivityArtwork type={a.type} />
                <button
                  className="favorite-button"
                  disabled={saving}
                  aria-label={`${profile.data.favorites.includes(a.id) ? 'Remove' : 'Add'} ${a.title} ${profile.data.favorites.includes(a.id) ? 'from' : 'to'} favorites`}
                  aria-pressed={profile.data.favorites.includes(a.id)}
                  onClick={() => favorite(a.id)}
                >
                  {profile.data.favorites.includes(a.id) ? '♥' : '♡'}
                </button>
                <span className="duration-badge">
                  <Icon name="clock" size={13} />
                  {a.minutes} min
                </span>
              </div>
              <div className="library-card-body">
                <p className="eyebrow">
                  {a.category} · {a.type}
                </p>
                <h3>{a.title}</h3>
                <p>{a.benefit}</p>
                <div className="section-title">
                  <small>{a.level}</small>
                  <Button variant="secondary" onClick={() => onStart(a)}>
                    Start
                    <Icon name="play" size={13} />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty title="Nothing in this corner yet">
          Try a different filter or save a favorite activity.
        </Empty>
      )}
      {!meditation && (
        <div className="mm-card external-tools">
          <SectionTitle title="A change of scenery, a different sound" />
          <p>
            These links open external services only when you choose. No account
            connection or location sharing is required by MoodMentor.
          </p>
          <div className="button-row">
            <a
              className="btn btn-secondary"
              href="https://www.google.com/maps/search/parks+near+me/"
              target="_blank"
              rel="noreferrer"
            >
              Explore nearby green spaces ↗
            </a>
            <a
              className="btn btn-secondary"
              href="https://open.spotify.com/search/calm%20instrumental"
              target="_blank"
              rel="noreferrer"
            >
              Find music on Spotify ↗
            </a>
            <a
              className="btn btn-secondary"
              href="https://www.youtube.com/results?search_query=calm+instrumental+music"
              target="_blank"
              rel="noreferrer"
            >
              Find music on YouTube ↗
            </a>
            <Button variant="secondary" onClick={() => navigate('studio')}>
              Open Mood Studio
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
