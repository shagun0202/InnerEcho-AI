import { useEffect, useRef, useState } from 'react'
import { request } from './api'

// Components
import Landing from './components/Landing'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Journal from './components/Journal'
import MoodStudio from './components/MoodStudio'
import Chat from './components/Chat'
import History from './components/History'
import QuickMoodCheckIn from './components/QuickMoodCheckIn'
import ProfileSettings from './components/ProfileSettings'
import AmbientPlayer from './components/AmbientPlayer'
import GuidedMeditation from './components/GuidedMeditation'
import WeeklyReport from './components/WeeklyReport'
import Achievements from './components/Achievements'
import MoodPlaylist from './components/MoodPlaylist'
import TeamMoodBoard from './components/TeamMoodBoard'
import KudosWall from './components/KudosWall'
import MeetingRecovery from './components/MeetingRecovery'
import WorkLifeBalance from './components/WorkLifeBalance'
import Onboarding from './components/Onboarding'

const SESSION_KEY = 'moodmentor-session'

export const emotions = {
  joy: ['😊', '#efaa42'],
  sadness: ['😢', '#5d87de'],
  fear: ['😰', '#856ee2'],
  anger: ['😠', '#e56467'],
  neutral: ['😐', '#96a0b3'],
  surprise: ['😲', '#ed8d5b'],
  disgust: ['🤢', '#54ae91'],
}

export const icon = (e) => (emotions[e] || emotions.neutral)[0]

export const pageInfo = {
  dashboard: ['Your overview', 'A gentle look at how you have been feeling.'],
  journal: ['Your journal', 'Put words to what is on your mind.'],
  studio: ['Mood Studio', 'A small visual reset, made just for this moment.'],
  chat: ['Talk With Me', 'Speak or write freely — I am here to listen and support you.'],
  history: ['Reflection history', 'Your private record of check-ins.'],
  quickmood: ['Quick check-in', 'How are you feeling right now?'],
  meditation: ['Guided meditation', 'A few minutes of stillness for your mind.'],
  achievements: ['Your achievements', 'Celebrate your wellness journey.'],
  report: ['Weekly report', 'Your AI-generated wellness summary.'],
  playlist: ['Mood playlist', 'Music matched to how you feel.'],
  team: ['Team mood', 'See how everyone is feeling today.'],
  kudos: ['Kudos wall', 'Celebrate your colleagues.'],
  recovery: ['Meeting recovery', 'A quick reset after your meeting.'],
  balance: ['Work-life balance', 'How balanced is your routine?'],
  profile: ['Settings', 'Your account and preferences.'],
}

function View(props) {
  if (props.view === 'journal') return <Journal {...props} />
  if (props.view === 'studio') return <MoodStudio />
  if (props.view === 'chat') return <Chat {...props} />
  if (props.view === 'history') return <History entries={props.data.history} />
  if (props.view === 'quickmood') return <QuickMoodCheckIn token={props.token} />
  if (props.view === 'meditation') return <GuidedMeditation />
  if (props.view === 'achievements') return <Achievements token={props.token} />
  if (props.view === 'report') return <WeeklyReport token={props.token} />
  if (props.view === 'playlist') return <MoodPlaylist data={props.data} />
  if (props.view === 'team') return <TeamMoodBoard token={props.token} />
  if (props.view === 'kudos') return <KudosWall token={props.token} />
  if (props.view === 'recovery') return <MeetingRecovery token={props.token} />
  if (props.view === 'balance') return <WorkLifeBalance token={props.token} />
  if (props.view === 'profile') return <ProfileSettings user={props.user} theme={props.theme} toggleTheme={props.toggleTheme} onLogout={props.logout} />
  return <Dashboard data={props.data} onNavigateJournal={() => props.setView('journal')} />
}

export default function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'))
  const [showAuth, setShowAuth] = useState(false)
  const [view, setView] = useState('dashboard')
  const [authMode, setAuthMode] = useState('login')
  const [error, setError] = useState('')
  const [data, setData] = useState({ summary: null, trends: [], distribution: null, history: [] })
  const [journal, setJournal] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [chat, setChat] = useState([])
  const [chatText, setChatText] = useState('')
  const [busy, setBusy] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('moodmentor-theme') || 'light')
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('moodmentor-onboarded'))

  const token = session?.token
  const user = session?.user
  const title = pageInfo[view] || pageInfo.dashboard

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('moodmentor-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  async function loadDashboard() {
    if (!token) return
    try {
      const [summary, trends, distribution, history] = await Promise.all([
        request('/analytics/summary', { token }), 
        request('/analytics/trends?days=30', { token }),
        request('/analytics/distribution?days=30', { token }), 
        request('/journal/history?limit=4', { token }),
      ])
      setData(prev => ({ ...prev, summary, trends, distribution, history }))
    } catch (e) { 
      setError(e.message) 
    }
  }

  useEffect(() => { 
    if (session) loadDashboard() 
  }, [session])

  useEffect(() => { 
    if (view === 'chat' && token && !chat.length) {
      request('/chat/history?limit=50', { token })
        .then(setChat)
        .catch(e => setError(e.message))
    }
    if (view === 'history' && token) {
      request('/journal/history?limit=50', { token })
        .then(history => setData(prev => ({ ...prev, history })))
        .catch(e => setError(e.message))
    }
  }, [view, token])

  async function authenticate(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    const form = new FormData(event.currentTarget)
    try {
      const result = await request(`/auth/${authMode}`, { method: 'POST', body: Object.fromEntries(form) })
      const next = { token: result.access_token, user: result.user }
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
      setSession(next)
    } catch (e) { 
      setError(e.message) 
    } finally { 
      setBusy(false) 
    }
  }

  async function submitJournal(event) {
    event.preventDefault()
    if (journal.trim().length < 3) return setError('Write a little more first.')
    setBusy(true)
    setError('')
    try { 
      const result = await request('/journal', { method: 'POST', token, body: { text: journal } })
      setAnalysis(result)
      setJournal('')
      loadDashboard() 
    } catch (e) { 
      setError(e.message) 
    } finally { 
      setBusy(false) 
    }
  }

  async function sendChat(event) {
    event.preventDefault()
    if (!chatText.trim()) return
    const message = chatText
    setChatText('')
    setBusy(true)
    try { 
      const result = await request('/chat', { method: 'POST', token, body: { text: message } })
      setChat(items => [...items, result.user_message, result.reply]) 
    } catch (e) { 
      setError(e.message) 
    } finally { 
      setBusy(false) 
    }
  }

  function logout() { 
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setData({ summary: null, trends: [], distribution: null, history: [] })
    setChat([]) 
  }

  if (!session) {
    return showAuth
      ? <Auth mode={authMode} setMode={setAuthMode} error={error} busy={busy} onSubmit={authenticate} />
      : <Landing onStart={() => { setAuthMode('signup'); setShowAuth(true) }} onLogin={() => { setAuthMode('login'); setShowAuth(true) }} />
  }

  return (
    <>
      <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard"><span>✦</span> MoodMentor</a>
        
        <div className="side-user">
          <div className="avatar">{user?.name?.[0] || '?'}</div>
          <div>
            <b>{user?.name || 'User'}</b>
            <small>Your calm space</small>
          </div>
        </div>
        
        <nav>
          {Object.keys(pageInfo).map(key => (
            <button 
              key={key} 
              className={view === key ? 'nav-active' : ''} 
              onClick={() => setView(key)}
            >
              <span>{({ dashboard: '⌂', journal: '✎', studio: '◉', chat: '🎙️', history: '◷', quickmood: '⚡', meditation: '🧘', achievements: '🏆', report: '📊', playlist: '🎵', team: '👥', kudos: '🎉', recovery: '☕', balance: '⚖️', profile: '⚙' })[key] || '•'}</span>
              {({ dashboard: 'Dashboard', journal: 'Journal', studio: 'Mood Studio', chat: 'Talk With Me', history: 'History', quickmood: 'Quick Check-in', meditation: 'Meditation', achievements: 'Achievements', report: 'Weekly Report', playlist: 'Mood Playlist', team: 'Team Mood', kudos: 'Kudos Wall', recovery: 'Meeting Recovery', balance: 'Work-Life Balance', profile: 'Settings' })[key] || key}
            </button>
          ))}
        </nav>
        
        <button className="logout" onClick={logout}>Sign out</button>
      </aside>
      
      <section className="main-content">
        <header>
          <div>
            <p className="eyebrow">MoodMentor</p>
            <h1>{title[0]}</h1>
            <p className="subtitle">{title[1]}</p>
          </div>
          <div className="header-avatar">{user?.name?.[0] || '?'}</div>
        </header>
        
        {error && (
          <div className="notice">
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}
        
        <div className="view-enter" key={view}>
          <View 
            view={view} 
            setView={setView}
            data={data} 
            journal={journal} 
            setJournal={setJournal} 
            analysis={analysis} 
            busy={busy} 
            submitJournal={submitJournal} 
            chat={chat} 
            chatText={chatText} 
            setChatText={setChatText} 
            sendChat={sendChat} 
            token={token}
            user={user}
            theme={theme}
            toggleTheme={toggleTheme}
            logout={logout}
          />
        </div>
      </section>
      <AmbientPlayer />
      </main>
      {showOnboarding && (
        <Onboarding onComplete={() => {
          localStorage.setItem('moodmentor-onboarded', '1')
          setShowOnboarding(false)
        }} />
      )}
    </>
  )
}
