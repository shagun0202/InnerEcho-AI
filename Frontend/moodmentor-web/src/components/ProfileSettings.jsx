export default function ProfileSettings({ user, theme, toggleTheme, onLogout }) {
  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Recently'

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <article className="panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
            {user?.name?.[0] || '?'}
          </div>
          <div>
            <h2>{user?.name || 'User'}</h2>
            <p className="muted">{user?.email || ''}</p>
            <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              Member since {memberSince}
            </small>
          </div>
        </div>
      </article>

      <article className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel-head" style={{ marginBottom: '1.5rem' }}>
          <h3>Preferences</h3>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
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

      <article className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel-head" style={{ marginBottom: '1.5rem' }}>
          <h3>Account</h3>
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
        <p>MoodMentor v1.0.0</p>
        <p style={{ marginTop: '0.5rem' }}>Your reflections are private and stored securely.</p>
      </div>
    </div>
  )
}
