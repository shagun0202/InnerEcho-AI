import { useState } from 'react'
import { api, beginGoogle } from '../lib/api'
import { useResource } from '../lib/hooks'
import {
  Button,
  Badge,
  Dialog,
  Empty,
  ErrorState,
  Icon,
  Loading,
} from '../components/ui'

export function PreferencesForm({ initial, onSaved, onboarding = false }) {
  const [form, setForm] = useState(() => ({
      ...initial,
      language: initial?.language || 'en',
      interests: initial?.interests || [],
      available_time_description: initial?.available_time_description || '',
      city: initial?.city || '',
    })),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [saved, setSaved] = useState(false)

  const update = (key, value) => {
    setForm({ ...form, [key]: value })
    setSaved(false)
  }
  const toggle = (key, value) =>
    update(
      key,
      form[key].includes(value)
        ? form[key].filter((v) => v !== value)
        : [...form[key], value],
    )
  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await api('/wellness/profile', {
        method: 'PUT',
        body: { ...form, onboarded: true },
      })
      setSaved(true)
      onSaved?.(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <form className="preferences-form" onSubmit={submit}>
      <fieldset>
        <legend>What would you like more room for?</legend>
        <div className="preference-options">
          {['calm', 'focus', 'energy', 'sleep', 'boundaries', 'connection'].map(
            (v) => (
              <button
                type="button"
                key={v}
                className={form.goals.includes(v) ? 'selected' : ''}
                aria-pressed={form.goals.includes(v)}
                onClick={() => toggle('goals', v)}
              >
                {v}
              </button>
            ),
          )}
        </div>
      </fieldset>
      <fieldset>
        <legend>Which activities feel like you?</legend>
        <div className="preference-options">
          {[
            'breathing',
            'meditation',
            'movement',
            'music',
            'walk',
            'focus',
            'social',
            'journaling',
          ].map((v) => (
            <button
              type="button"
              key={v}
              className={form.preferred_types.includes(v) ? 'selected' : ''}
              aria-pressed={form.preferred_types.includes(v)}
              onClick={() => toggle('preferred_types', v)}
            >
              {v}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Personal interests (optional)</legend>
        <div className="preference-options">
          {[
            'reading',
            'music',
            'nature',
            'exercise',
            'cooking',
            'art',
            'gaming',
            'writing',
          ].map((v) => (
            <button
              type="button"
              key={v}
              className={form.interests.includes(v) ? 'selected' : ''}
              aria-pressed={form.interests.includes(v)}
              onClick={() => toggle('interests', v)}
            >
              {v}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="form-grid">
        <label>
          Preferred language
          <select
            value={form.language}
            onChange={(e) => update('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="ml">മലയാളം (Malayalam)</option>
            <option value="ta">தமிழ் (Tamil)</option>
          </select>
        </label>
        <label>
          City or region (optional, for nearby places)
          <input
            type="text"
            value={form.city}
            placeholder="e.g. Pune, London"
            maxLength={100}
            onChange={(e) => update('city', e.target.value)}
          />
        </label>
      </div>
      <label>
        When do you usually have time for a break? (optional)
        <input
          type="text"
          value={form.available_time_description}
          placeholder="e.g. Weekday evenings after 7pm, Sunday mornings"
          maxLength={200}
          onChange={(e) => update('available_time_description', e.target.value)}
        />
      </label>
      <div className="form-grid">

        <label>
          Usual session length
          <select
            value={form.preferred_minutes}
            onChange={(e) => update('preferred_minutes', +e.target.value)}
          >
            {[2, 3, 5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n} minutes
              </option>
            ))}
          </select>
        </label>
        <label>
          Weekly intention
          <select
            value={form.weekly_goal}
            onChange={(e) => update('weekly_goal', +e.target.value)}
          >
            {[1, 2, 3, 4, 5, 7, 10, 14].map((n) => (
              <option key={n} value={n}>
                {n} sessions
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-grid">
        <label>
          Timezone
          <select
            value={form.timezone}
            onChange={(e) => update('timezone', e.target.value)}
          >
            {[
              'Asia/Kolkata',
              'UTC',
              'America/New_York',
              'America/Los_Angeles',
              'Europe/London',
              'Europe/Berlin',
              'Asia/Singapore',
              'Australia/Sydney',
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <div className="form-grid">
          <label>
            Work starts
            <select
              value={form.work_start}
              onChange={(e) => update('work_start', +e.target.value)}
            >
              {Array.from({ length: 24 }, (_, n) => (
                <option key={n} value={n}>
                  {String(n).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </label>
          <label>
            Work ends
            <select
              value={form.work_end}
              onChange={(e) => update('work_end', +e.target.value)}
            >
              {Array.from({ length: 24 }, (_, n) => (
                <option key={n} value={n + 1}>
                  {String(n + 1).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <label className="consent-row">
        <input
          type="checkbox"
          checked={form.reminders_enabled}
          onChange={(e) => update('reminders_enabled', e.target.checked)}
        />
        <span>
          <b>Gentle reminders inside MoodMentor</b>
          <small>
            Optional check-in and unfinished-session reminders. No push
            messages, email, or SMS.
          </small>
        </span>
      </label>
      <label className="consent-row">
        <input
          type="checkbox"
          checked={form.ai_consent}
          onChange={(e) => update('ai_consent', e.target.checked)}
        />
        <span>
          <b>Enable optional Gemini assistance</b>
          <small>
            Allow journal text, recent chat context, and wellness summaries to
            be sent to Google Gemini for contextual responses. Local rules and
            curated guidance work without this. You can turn it off anytime; it
            does not remove data already processed by the provider.
          </small>
        </span>
      </label>
      {error && (
        <p role="alert" className="inline-error">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="success-note">
          Your preferences are saved.
        </p>
      )}
      <Button disabled={busy}>
        {busy
          ? 'Saving…'
          : onboarding
            ? 'Enter my wellness space'
            : 'Save preferences'}
        <Icon name="arrow" size={16} />
      </Button>
    </form>
  )
}

export default function Profile({
  user,
  settings = false,
  theme,
  toggleTheme,
}) {
  const profile = useResource('/wellness/profile'),
    integration = useResource('/integrations/status'),
    contacts = useResource('/safety/contacts')
  const [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [deleteRole, setDeleteRole] = useState(null)

  async function saveContactRole(role, values) {
    setBusy(true)
    setError('')
    try {
      await api('/safety/contact', {
        method: 'POST',
        body: {
          ...values,
          role,
          email: values.email || null,
          notification_mode: 'ask',
        },
      })
      setNotice(
        'Contact saved. Automatic delivery is unavailable; call your contact directly.',
      )
      contacts.reload()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function removeContactRole(role) {
    setBusy(true)
    setError('')
    try {
      await api(`/safety/contact/${role}`, { method: 'DELETE' })
      setNotice('Contact removed.')
      contacts.reload()
      setDeleteRole(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const failed = [profile, integration, contacts].find((r) => r.error)
  if (failed)
    return (
      <ErrorState
        error={failed.error}
        retry={() => {
          profile.reload()
          integration.reload()
          contacts.reload()
        }}
      />
    )

  if (profile.loading || integration.loading || contacts.loading)
    return <Loading />
  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">
            {settings ? 'SETTINGS & PRIVACY' : 'YOUR WELLNESS PROFILE'}
          </p>
          <h1>
            {settings
              ? 'Your space. Your choices.'
              : 'A rhythm that feels like you.'}
          </h1>
          <p>
            {settings
              ? 'Manage your account connections, privacy, and support options.'
              : 'Your preferences guide suggestions. Your feedback makes them more personal.'}
          </p>
        </div>
      </div>
      <article className="mm-card profile-identity">
        <span className="profile-avatar">{user.name[0]}</span>
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
        <Badge>
          <Icon name="shield" size={14} />
          Private account
        </Badge>
      </article>
      {!settings ? (
        <article className="mm-card">
          <h2>Make your wellness space your own</h2>
          <p className="muted">
            Choose what feels useful. You can change any of this later.
          </p>
          <PreferencesForm initial={profile.data} onSaved={profile.setData} />
        </article>
      ) : (
        <div className="settings-grid">
          <article className="mm-card">
            <h2>Privacy, in plain language</h2>
            <ul className="privacy-list">
              <li>
                Journals, chat, check-ins, and sessions are scoped to your
                account.
              </li>
              <li>
                Your team sees only opt-in aggregate mood patterns after enough
                members participate. Kudos are named and visible to your team.
              </li>
              <li>
                Google sign-in requests identity only. Photos and Contacts
                access is unavailable.
              </li>
              <li>
                AI sharing is {profile.data.ai_consent ? 'enabled' : 'off'}.
                Change this on your Profile.
              </li>
              <li>
                Private data is stored in the application database. Production
                operators must configure storage encryption, backups, and
                retention.
              </li>
            </ul>
            <Button variant="secondary" onClick={toggleTheme}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
              Use {theme === 'dark' ? 'light' : 'dark'} theme
            </Button>
          </article>
          <article className="mm-card">
            <div className="section-title">
              <h2>Google account</h2>
              <Badge>
                {integration.data.google_connected
                  ? 'Connected'
                  : 'Not connected'}
              </Badge>
            </div>
            <p>
              Secure identity sign-in with explicit account linking. No access
              to your Google Photos or Contacts.
            </p>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                setError('')
                try {
                  if (integration.data.google_connected) {
                    await api('/integrations/disconnect', { method: 'DELETE' })
                    integration.reload()
                  } else await beginGoogle()
                } catch (e) {
                  setError(e.message)
                } finally {
                  setBusy(false)
                }
              }}
            >
              {integration.data.google_connected
                ? 'Disconnect Google'
                : 'Link Google account'}
              <Icon name="arrow" size={16} />
            </Button>
            <p className="quiet-note">
              Google must be configured by the application operator. Accounts
              using Google as their only sign-in method must keep it linked.
            </p>
          </article>
          <article className="mm-card">
            <h2>People you trust</h2>
            <p>
              Save contacts you can reach quickly if you need support. MoodMentor
              will never contact them automatically.
            </p>
            {[
              {
                role: 'trusted_contact',
                title: 'Primary Trusted Contact',
                desc: 'A mentor, counselor, or trusted individual.',
              },
              {
                role: 'best_friend',
                title: 'Best Friend',
                desc: 'Someone close you can talk to freely.',
              },
              {
                role: 'family',
                title: 'Close Family Member',
                desc: 'A family member for emergency check-in.',
              },
            ].map((slot) => {
              const item = (contacts.data || []).find(
                (c) => c.role === slot.role,
              )
              return (
                <div key={slot.role} className="contact-slot" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <b style={{ fontSize: '1rem' }}>{slot.title}</b>
                      <p className="quiet-note" style={{ margin: '2px 0 8px' }}>{slot.desc}</p>
                    </div>
                    {item && <Badge>Saved</Badge>}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const data = Object.fromEntries(new FormData(e.currentTarget))
                      saveContactRole(slot.role, data)
                    }}
                  >
                    <div className="form-grid">
                      <label>
                        Name
                        <input
                          name="name"
                          defaultValue={item?.name || ''}
                          required
                          maxLength={100}
                          placeholder="Full name"
                        />
                      </label>
                      <label>
                        Phone
                        <input
                          type="tel"
                          name="phone"
                          defaultValue={item?.phone || ''}
                          required
                          maxLength={30}
                          placeholder="Include country code"
                        />
                      </label>
                    </div>
                    <label>
                      Email (optional)
                      <input
                        type="email"
                        name="email"
                        defaultValue={item?.email || ''}
                        placeholder="Email address"
                      />
                    </label>
                    <div className="button-row" style={{ marginTop: '8px' }}>
                      <Button disabled={busy}>
                        {item ? 'Update' : 'Save'} {slot.title}
                      </Button>
                      {item && (
                        <Button
                          variant="secondary"
                          type="button"
                          disabled={busy}
                          onClick={() => setDeleteRole(slot.role)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              )
            })}
          </article>
          <article className="mm-card">
            <h2>Notifications</h2>
            <p>
              {profile.data.reminders_enabled
                ? 'In-app reminders are enabled.'
                : 'Reminders are off.'}{' '}
              Change reminder preferences on your Profile.
            </p>
            <Badge>External delivery unavailable</Badge>
            <p className="quiet-note">
              We never show a delivery confirmation for a message that has not
              been delivered.
            </p>
          </article>
        </div>
      )}
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
      {deleteRole && (
        <Dialog
          title="Remove this contact?"
          onClose={() => setDeleteRole(null)}
        >
          <p>The saved contact details will be deleted.</p>
          <Button
            disabled={busy}
            variant="danger"
            onClick={() => removeContactRole(deleteRole)}
          >
            Remove contact
          </Button>
        </Dialog>
      )}
    </>
  )
}
