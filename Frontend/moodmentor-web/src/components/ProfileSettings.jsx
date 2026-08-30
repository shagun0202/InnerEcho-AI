import React, { useState, useEffect } from 'react'
import { request } from '../api'

export default function ProfileSettings({ user, token, theme, toggleTheme, onLogout }) {
  const [contact, setContact] = useState({
    name: '',
    relationship_type: 'Friend',
    phone: '',
    email: '',
    notification_mode: 'ask',
  })
  const [contactSaved, setContactSaved] = useState(false)
  const [contactLoading, setContactLoading] = useState(false)
  const [contactError, setContactError] = useState('')

  // Load trusted contact
  useEffect(() => {
    async function loadData() {
      if (!token) return
      try {
        const c = await request('/safety/contact', { token })
        if (c) setContact(c)
      } catch (e) {
        console.warn('Could not fetch trusted contact:', e)
      }
    }
    loadData()
  }, [token])

  // Save trusted contact
  const handleSaveContact = async (e) => {
    e.preventDefault()
    setContactLoading(true)
    setContactError('')
    setContactSaved(false)
    try {
      const res = await request('/safety/contact', {
        method: 'POST',
        token,
        body: contact,
      })
      if (res) {
        setContact(res)
        setContactSaved(true)
        setTimeout(() => setContactSaved(false), 3000)
      }
    } catch (err) {
      setContactError(err.message || 'Failed to save contact.')
    } finally {
      setContactLoading(false)
    }
  }

  // Delete trusted contact
  const handleDeleteContact = async () => {
    if (!window.confirm('Remove this trusted contact?')) return
    setContactLoading(true)
    try {
      await request('/safety/contact', { method: 'DELETE', token })
      setContact({
        name: '',
        relationship_type: 'Friend',
        phone: '',
        email: '',
        notification_mode: 'ask',
      })
      setContactSaved(true)
    } catch (err) {
      setContactError(err.message)
    } finally {
      setContactLoading(false)
    }
  }

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Recently'

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Profile Overview */}
      <article className="panel" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="avatar" style={{ width: '72px', height: '72px', fontSize: '1.8rem' }}>
            {user?.name?.[0] || '?'}
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px' }}>{user?.name || 'User'}</h2>
            <p className="muted" style={{ margin: 0 }}>{user?.email || ''}</p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
              <span className="badge">
                ✉️ MoodMentor Account
              </span>
              <small style={{ color: 'var(--text-muted)' }}>Member since {memberSince}</small>
            </div>
          </div>
        </div>
      </article>

      {/* Trusted Contact Section */}
      <article className="panel" style={{ marginBottom: '1.5rem' }}>
        <div className="panel-head" style={{ marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '1.2rem', marginRight: '6px' }}>👥</span>
            <b>Trusted Contact (Wellness & Safety)</b>
          </div>
        </div>
        <p className="muted" style={{ fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
          Add a trusted person who can support you if you are experiencing severe distress. MoodMentor will never automatically send your private notes or chats.
        </p>

        <form onSubmit={handleSaveContact} className="trusted-contact-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <label>
              Contact Name *
              <input
                required
                type="text"
                placeholder="e.g. Sarah / Mom"
                value={contact.name || ''}
                onChange={(e) => setContact({ ...contact, name: e.target.value })}
              />
            </label>
            <label>
              Relationship *
              <select
                value={contact.relationship_type || 'Friend'}
                onChange={(e) => setContact({ ...contact, relationship_type: e.target.value })}
                className="med-select"
                style={{ width: '100%', height: '42px', marginTop: '4px' }}
              >
                <option value="Friend">Friend</option>
                <option value="Family">Family Member</option>
                <option value="Partner">Partner / Spouse</option>
                <option value="Counselor">Counselor / Therapist</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <label>
              Phone Number *
              <input
                required
                type="tel"
                placeholder="+91 98765 43210"
                value={contact.phone || ''}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              />
            </label>
            <label>
              Email (Optional)
              <input
                type="email"
                placeholder="contact@example.com"
                value={contact.email || ''}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <b style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>
              Automatic Safety Notification Preference:
            </b>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="radio"
                  name="notification_mode"
                  value="ask"
                  checked={contact.notification_mode === 'ask'}
                  onChange={(e) => setContact({ ...contact, notification_mode: e.target.value })}
                />
                <div>
                  <b>Ask me before notifying (Recommended)</b>
                  <p className="muted" style={{ margin: 0 }}>MoodMentor displays a confirmation prompt before sending any notification.</p>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="radio"
                  name="notification_mode"
                  value="never"
                  checked={contact.notification_mode === 'never'}
                  onChange={(e) => setContact({ ...contact, notification_mode: e.target.value })}
                />
                <div>
                  <b>Never notify automatically</b>
                  <p className="muted" style={{ margin: 0 }}>Notifications are only triggered if you explicitly click the button.</p>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="radio"
                  name="notification_mode"
                  value="automatic"
                  checked={contact.notification_mode === 'automatic'}
                  onChange={(e) => setContact({ ...contact, notification_mode: e.target.value })}
                />
                <div>
                  <b>Notify automatically in high-risk situation</b>
                  <p className="muted" style={{ margin: 0 }}>Sends a minimal check-in notice if critical distress signals are detected.</p>
                </div>
              </label>
            </div>
          </div>

          {contactError && <p className="form-error" style={{ marginBottom: '12px' }}>{contactError}</p>}
          {contactSaved && <p className="form-success" style={{ color: 'var(--accent)', marginBottom: '12px' }}>✓ Trusted contact settings saved.</p>}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="primary" disabled={contactLoading}>
              {contactLoading ? 'Saving…' : 'Save Trusted Contact'}
            </button>
            {contact.id && (
              <button type="button" className="med-btn-ghost" onClick={handleDeleteContact} disabled={contactLoading}>
                Remove Contact
              </button>
            )}
          </div>
        </form>
      </article>

      {/* Preferences & Theme */}
      <article className="panel" style={{ marginBottom: '1.5rem' }}>
        <div className="panel-head" style={{ marginBottom: '1rem' }}>
          <h3>Preferences</h3>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
          <div>
            <b>Theme</b>
            <p className="muted" style={{ fontSize: '0.875rem' }}>Choose your preferred color mode</p>
          </div>
          <button 
            onClick={toggleTheme}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '20px', 
              background: 'var(--surface-hover)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </article>

      {/* Sign Out */}
      <article className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel-head" style={{ marginBottom: '1rem' }}>
          <h3>Account Actions</h3>
        </div>
        <button 
          onClick={onLogout}
          style={{ 
            color: 'var(--error)', 
            background: 'transparent', 
            border: '1px solid var(--error)', 
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Sign out
        </button>
      </article>
      
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <p>MoodMentor v1.0.0 · Privacy-First Emotional Wellness</p>
      </div>
    </div>
  )
}
