import { useEffect, useRef, useState } from 'react'
import { api, beginGoogle, saveSession } from '../lib/api'
import { Brand, Button, Icon } from '../components/ui'
import { WellnessPhoto } from '../components/WellnessVisual'

export default function Auth({
  mode,
  setMode,
  onSession,
  onBack,
  callback = false,
}) {
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(callback),
    [google, setGoogle] = useState(false)
  const started = useRef(false)
  useEffect(() => {
    api('/auth/google/config', { token: null })
      .then((r) => setGoogle(r.enabled))
      .catch(() => {})
  }, [])
  useEffect(() => {
    if (!callback || started.current) return
    started.current = true
    const params = new URLSearchParams(window.location.search)
    const run = async () => {
      try {
        const pending = JSON.parse(
          sessionStorage.getItem('google-pkce') || 'null',
        )
        sessionStorage.removeItem('google-pkce')
        window.history.replaceState({}, '', '/')
        if (params.get('error'))
          throw new Error(
            'Google sign-in was cancelled. You can try again or use email.',
          )
        if (!pending || pending.state !== params.get('state'))
          throw new Error(
            'Google sign-in could not be verified. Please start again.',
          )
        const result = await api('/auth/google/callback', {
          method: 'POST',
          token: null,
          body: {
            code: params.get('code'),
            state: params.get('state'),
            code_verifier: pending.verifier,
          },
        })
        onSession(saveSession(result))
      } catch (e) {
        setError(e.message)
      } finally {
        setBusy(false)
      }
    }
    run()
  }, [callback, onSession])
  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await api(`/auth/${mode}`, {
        method: 'POST',
        token: null,
        body: Object.fromEntries(new FormData(e.currentTarget)),
      })
      onSession(saveSession(result))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  async function googleLogin() {
    setBusy(true)
    setError('')
    try {
      await beginGoogle()
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }
  return (
    <main className="auth-v2">
      <section className="auth-story">
        <button className="brand-back" onClick={onBack}>
          <Brand />
        </button>
        <div>
          <p className="eyebrow">A LITTLE SPACE FOR YOURSELF</p>
          <h1>
            Your workday has a lot in it.
            <br />
            <em>You belong in it, too.</em>
          </h1>
          <p>A thoughtful space to reflect, reset, and find your own rhythm.</p>
        </div>
        <WellnessPhoto eager scene="pause" className="auth-photo" />
      </section>
      <section className="auth-form-wrap">
        <form onSubmit={submit} className="auth-form">
          <span className="eyebrow">
            {mode === 'login' ? 'WELCOME BACK' : 'BEGIN WITH ONE SMALL STEP'}
          </span>
          <h2>
            {mode === 'login' ? 'Good to see you again.' : 'Make room for you.'}
          </h2>
          <p>
            {mode === 'login'
              ? 'Sign in to your private wellness space.'
              : 'Create an account. Build a healthier rhythm.'}
          </p>
          {google ? (
            <Button
              variant="secondary"
              type="button"
              className="full"
              disabled={busy}
              onClick={googleLogin}
            >
              <span className="google-g">G</span>Continue with Google
            </Button>
          ) : (
            <p className="quiet-note">
              Google sign-in is not configured on this installation.
            </p>
          )}
          <div className="divider">
            <span>or continue with email</span>
          </div>
          {mode === 'signup' && (
            <label>
              Your name
              <input
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={50}
                placeholder="What should we call you?"
              />
            </label>
          )}
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete={
                mode === 'signup' ? 'new-password' : 'current-password'
              }
              minLength={mode === 'signup' ? 8 : 1}
              maxLength={72}
              required
              placeholder={
                mode === 'signup' ? 'At least 8 characters' : 'Your password'
              }
            />
          </label>
          {error && (
            <p role="alert" className="inline-error">
              {error}
            </p>
          )}
          <Button className="full" disabled={busy}>
            {busy
              ? 'Please wait…'
              : mode === 'login'
                ? 'Sign in to your space'
                : 'Create account'}
            <Icon name="arrow" size={17} />
          </Button>
          <p className="auth-switch">
            {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setError('')
              }}
            >
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
          <p className="quiet-note">
            <Icon name="shield" size={15} />
            Private by default. Optional AI sharing is explained in setup.
          </p>
        </form>
      </section>
    </main>
  )
}
