import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { readSession, SESSION_KEY } from './lib/api'
import { useResource, useRoute, navigate } from './lib/hooks'
import {
  Brand,
  Button,
  Dialog,
  ErrorBoundary,
  ErrorState,
  Icon,
  Loading,
} from './components/ui'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
const Companion = lazy(() => import('./pages/Companion'))
const Progress = lazy(() => import('./pages/Progress'))
const Library = lazy(() => import('./pages/Library'))
const Team = lazy(() => import('./pages/Team'))
const Profile = lazy(() => import('./pages/Profile'))
const Studio = lazy(() => import('./pages/Studio'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const PreferencesForm = lazy(() =>
  import('./pages/Profile').then((m) => ({ default: m.PreferencesForm })),
)
const SessionPlayer = lazy(() => import('./components/SessionPlayer'))
const SafetyDialog = lazy(() => import('./components/SafetyDialog'))
const NAV = [
  ['companion', 'chat', 'Companion'],
  ['progress', 'insights', 'Progress'],
  ['team', 'team', 'Workplace'],
  ['profile', 'profile', 'Profile'],
]

function Workspace({ session, onLogout, theme, toggleTheme }) {
  const rawRoute = useRoute()
  const route =
    {
      dashboard: 'companion',
      journal: 'companion',
      insights: 'progress',
      history: 'progress',
    }[rawRoute] || rawRoute
  const profile = useResource('/wellness/profile'),
    summary = useResource('/wellness/summary')
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('moodmentor-nav-collapsed') !== 'false',
  )
  const [menu, setMenu] = useState(false),
    [player, setPlayer] = useState(null),
    [safety, setSafety] = useState(null),
    [notifications, setNotifications] = useState(false),
    [revision, setRevision] = useState(0)
  const mobileButton = useRef(null),
    sidebar = useRef(null)
  useEffect(() => {
    setMenu(false)
    window.scrollTo(0, 0)
  }, [rawRoute])
  useEffect(() => {
    localStorage.setItem('moodmentor-nav-collapsed', String(collapsed))
  }, [collapsed])
  useEffect(() => {
    if (!menu) return
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusable = () =>
      [...sidebar.current.querySelectorAll('a, button')].filter(
        (el) => el.getClientRects().length,
      )
    focusable()[0]?.focus()
    const keys = (e) => {
      if (e.key === 'Escape') {
        setMenu(false)
        mobileButton.current?.focus()
      }
      if (e.key === 'Tab') {
        const items = focusable(),
          first = items[0],
          last = items.at(-1)
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener('keydown', keys)
    return () => {
      document.body.style.overflow = oldOverflow
      window.removeEventListener('keydown', keys)
    }
  }, [menu])
  const onStart = (activity, planId, existing) =>
    setPlayer({ activity, planId, existing })
  const refresh = () => {
    setRevision((n) => n + 1)
    summary.reload()
  }
  const props = {
    user: session.user,
    onStart,
    onSafety: setSafety,
    theme,
    toggleTheme,
    audioBlocked: !!player || !!safety || notifications,
  }
  const view =
    route === 'companion' ? (
      <Companion
        {...props}
        revision={revision}
        initialReflection={rawRoute === 'journal'}
      />
    ) : route === 'progress' ? (
      <Progress
        key={rawRoute}
        initial={rawRoute === 'history' ? 'history' : 'patterns'}
      />
    ) : route === 'team' ? (
      <Team />
    ) : route === 'profile' ? (
      <Profile {...props} />
    ) : route === 'settings' ? (
      <Profile {...props} settings />
    ) : route === 'meditation' ? (
      <Library meditation {...props} />
    ) : route === 'wellness' ? (
      <Library {...props} />
    ) : route === 'studio' ? (
      <Studio />
    ) : route === 'checkin' ? (
      <Dashboard {...props} />
    ) : (
      <ErrorState
        error="This page does not exist."
        retry={() => navigate('companion')}
      />
    )
  if (profile.loading && !profile.data) return <Loading />
  if (profile.error)
    return <ErrorState error={profile.error} retry={profile.reload} />
  return (
    <div
      className={`workspace refresh-workspace ${collapsed ? 'nav-collapsed' : ''} ${route === 'companion' ? 'is-companion' : ''}`}
    >
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to content
      </a>
      {menu && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => {
            setMenu(false)
            mobileButton.current?.focus()
          }}
        />
      )}
      <aside
        ref={sidebar}
        className={`mm-sidebar refresh-sidebar ${menu ? 'is-open' : ''}`}
        aria-label="Workspace navigation"
        onClick={(e) => {
          if (menu && e.target.closest('a[href^="#"]')) {
            setMenu(false)
            mobileButton.current?.focus()
          }
        }}
      >
        <a
          href="#companion"
          className="sidebar-brand"
          aria-label="MoodMentor home"
        >
          <Brand />
        </a>
        <button
          className="nav-toggle icon-button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((v) => !v)}
        >
          <Icon name="panel" />
        </button>
        <button
          className="mobile-nav-close icon-button"
          aria-label="Close navigation"
          onClick={() => {
            setMenu(false)
            mobileButton.current?.focus()
          }}
        >
          <Icon name="close" />
        </button>
        <p className="nav-section-label">YOUR SPACE</p>
        <nav aria-label="Main navigation">
          {NAV.map(([key, icon, label]) => (
            <a
              key={key}
              href={'#' + key}
              aria-label={label}
              title={collapsed ? label : undefined}
              className={route === key ? 'active' : ''}
              aria-current={route === key ? 'page' : undefined}
            >
              <Icon name={icon} />
              <span className="nav-label">{label}</span>
              {key === 'companion' && <span className="nav-ai">AI</span>}
            </a>
          ))}
        </nav>
        <div className="sidebar-mantra">
          <span className="mantra-flower" aria-hidden="true">
            ✳
          </span>
          <p>
            A small pause.
            <br />A fresh perspective.
          </p>
          <button
            className="text-button"
            onClick={() => navigate('meditation')}
          >
            Find your reset <Icon name="arrow" size={15} />
          </button>
        </div>
        <nav className="secondary-nav" aria-label="Account navigation">
          <a
            href="#settings"
            title={collapsed ? 'Settings' : undefined}
            aria-label="Settings"
            className={route === 'settings' ? 'active' : ''}
          >
            <Icon name="settings" />
            <span className="nav-label">Settings & privacy</span>
          </a>
          <button
            className="nav-support"
            title={collapsed ? 'Support resources' : undefined}
            onClick={() => setSafety({})}
          >
            <Icon name="shield" />
            <span className="nav-label">Human support</span>
            <span className="sr-only">Support resources</span>
          </button>
        </nav>
        <div className="sidebar-user">
          <span className="user-avatar">{session.user.name[0]}</span>
          <div>
            <b>{session.user.name}</b>
            <small>A space just for you</small>
          </div>
          <button
            className="icon-button"
            aria-label="Sign out"
            title="Sign out"
            onClick={onLogout}
          >
            <Icon name="logout" size={17} />
          </button>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              ref={mobileButton}
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-expanded={menu}
              onClick={() => setMenu(true)}
            >
              <Icon name="menu" />
            </button>
            <span className="topbar-wordmark">
              MoodMentor<span> / </span>
            </span>
            <b>
              {NAV.find((n) => n[0] === route)?.[2] ||
                {
                  settings: 'Settings',
                  meditation: 'Meditation',
                  wellness: 'Reset Library',
                  studio: 'Mood Lens',
                  checkin: 'Quick check-in',
                }[route]}
            </b>
          </div>
          <div className="topbar-actions">
            <span className="private-indicator">
              <span className="privacy-dot" />
              Your private space
            </span>
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />
            </button>
            <button
              className="icon-button notification-button"
              aria-label="Open reminders"
              onClick={() => setNotifications(true)}
            >
              <Icon name="bell" size={19} />
              {summary.data?.notifications.length > 0 && <i />}
            </button>
            <button
              className="user-avatar"
              aria-label="Open profile"
              onClick={() => navigate('profile')}
            >
              {session.user.name[0]}
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="page-content">
          <ErrorBoundary key={rawRoute}>
            <Suspense fallback={<Loading />}>{view}</Suspense>
          </ErrorBoundary>
          {route !== 'companion' && (
            <footer className="app-footer">
              <span>MoodMentor · Make room for yourself.</span>
              <button className="text-button" onClick={() => setSafety({})}>
                Support resources
              </button>
            </footer>
          )}
        </main>
      </div>
      {!profile.data.onboarded && (
        <Dialog title="Let’s make this space yours." wide>
          <p>
            Choose what feels useful. You can change these preferences any time.
          </p>
          <Suspense fallback={<Loading />}>
            <PreferencesForm
              initial={profile.data}
              onboarding
              onSaved={(data) => {
                profile.setData(data)
                summary.reload()
              }}
            />
          </Suspense>
        </Dialog>
      )}
      {player && (
        <Suspense fallback={<Loading />}>
          <SessionPlayer
            {...player}
            onClose={() => {
              setPlayer(null)
              refresh()
            }}
            onComplete={refresh}
          />
        </Suspense>
      )}
      {safety && (
        <Suspense fallback={<Loading />}>
          <SafetyDialog safety={safety} onClose={() => setSafety(null)} />
        </Suspense>
      )}
      {notifications && (
        <Dialog title="A gentle nudge" onClose={() => setNotifications(false)}>
          {summary.error ? (
            <ErrorState error={summary.error} retry={summary.reload} />
          ) : summary.data?.notifications.length ? (
            summary.data.notifications.map((n) => (
              <article className="notification-item" key={n.id}>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                <Button
                  onClick={() => {
                    navigate(n.action)
                    setNotifications(false)
                  }}
                >
                  Take a moment
                </Button>
              </article>
            ))
          ) : (
            <p>
              No reminders right now. Optional in-app reminders are available in
              your Profile.
            </p>
          )}
        </Dialog>
      )}
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(readSession),
    [authMode, setAuthMode] = useState('login'),
    [showAuth, setShowAuth] = useState(
      window.location.pathname === '/auth/google/callback',
    ),
    [callback, setCallback] = useState(
      window.location.pathname === '/auth/google/callback',
    )
  const [theme, setTheme] = useState(
      () => localStorage.getItem('moodmentor-theme') || 'light',
    ),
    [expired, setExpired] = useState(false)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('moodmentor-theme', theme)
  }, [theme])
  useEffect(() => {
    localStorage.removeItem('moodmentor-session')
    const expiredSession = () => {
      sessionStorage.removeItem(SESSION_KEY)
      setSession(null)
      setShowAuth(true)
      setExpired(true)
    }
    window.addEventListener('session-expired', expiredSession)
    return () => window.removeEventListener('session-expired', expiredSession)
  }, [])
  function accept(next) {
    window.history.replaceState({}, '', '/#companion')
    setSession(next)
    setCallback(false)
    setExpired(false)
  }
  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setSession(null)
    setShowAuth(false)
    setCallback(false)
    window.history.replaceState({}, '', '/')
  }
  const toggleTheme = () => setTheme((v) => (v === 'dark' ? 'light' : 'dark'))
  if (callback || !session)
    return (
      <>
        {expired && (
          <div className="session-notice" role="status">
            Your session expired. Please sign in again.
          </div>
        )}
        {showAuth ? (
          <Auth
            mode={authMode}
            setMode={setAuthMode}
            onSession={accept}
            callback={callback}
            onBack={() => {
              setShowAuth(false)
              setCallback(false)
              window.history.replaceState({}, '', '/')
            }}
          />
        ) : (
          <Landing
            onAuth={(mode) => {
              setAuthMode(mode)
              setShowAuth(true)
            }}
          />
        )}
      </>
    )
  return (
    <Workspace
      key={session.user.id}
      session={session}
      onLogout={logout}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  )
}
