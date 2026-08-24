export default function Auth({ mode, setMode, error, busy, onSubmit }) {
  return (
    <main className="auth-page">
      <section className="auth-intro">
        <a className="brand"><span>✦</span> MoodMentor</a>
        <div>
          <p className="eyebrow">YOUR WELLBEING, UNDERSTOOD</p>
          <h1>A quieter place to understand yourself.</h1>
          <p>Reflect, notice emotional patterns, and find small, practical ways forward.</p>
        </div>
        <div className="intro-orb">☀</div>
      </section>
      <section className="auth-card-wrap">
        <form className="auth-card" onSubmit={onSubmit}>
          <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'BEGIN YOUR JOURNEY'}</p>
          <h2>{mode === 'login' ? 'Good to see you.' : 'Create your space.'}</h2>
          <p className="muted">{mode === 'login' ? 'Sign in to continue your wellbeing journey.' : 'A few details and your private space is ready.'}</p>
          
          {mode === 'signup' && (
            <label>
              Name
              <input required minLength="2" name="name" placeholder="Your name" />
            </label>
          )}
          
          <label>
            Email
            <input required type="email" name="email" placeholder="you@example.com" />
          </label>
          
          <label>
            Password
            <input required minLength="6" type="password" name="password" placeholder="At least 6 characters" />
          </label>
          
          {error && <p className="form-error">{error}</p>}
          
          <button className="primary full" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in →' : 'Create account →'}
          </button>
          
          <p className="switcher">
            {mode === 'login' ? 'New to MoodMentor?' : 'Already have an account?'} 
            <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </form>
      </section>
    </main>
  )
}
