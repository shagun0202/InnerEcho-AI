import { useEffect, useRef, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { request } from './api'

const SESSION_KEY = 'moodmentor-session'
const emotions = { joy: ['😊', '#efaa42'], sadness: ['😢', '#5d87de'], fear: ['😰', '#856ee2'], anger: ['😠', '#e56467'], neutral: ['😐', '#96a0b3'], surprise: ['😲', '#ed8d5b'], disgust: ['🤢', '#54ae91'] }
const icon = e => (emotions[e] || emotions.neutral)[0]
const pageInfo = { dashboard: ['Your overview', 'A gentle look at how you have been feeling.'], journal: ['Your journal', 'Put words to what is on your mind.'], studio: ['Mood Studio', 'A small visual reset, made just for this moment.'], chat: ['Companion chat', 'Talk things through at your own pace.'], history: ['Reflection history', 'Your private record of check-ins.'] }

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

  const token = session?.token
  const user = session?.user
  const title = pageInfo[view] || pageInfo.dashboard

  async function loadDashboard() {
    if (!token) return
    try {
      const [summary, trends, distribution, history] = await Promise.all([
        request('/analytics/summary', { token }), request('/analytics/trends?days=30', { token }),
        request('/analytics/distribution?days=30', { token }), request('/journal/history?limit=4', { token }),
      ])
      setData({ summary, trends, distribution, history })
    } catch (e) { setError(e.message) }
  }

  useEffect(() => { if (session) loadDashboard() }, [session])
  useEffect(() => { if (view === 'chat' && token && !chat.length) request('/chat/history?limit=50', { token }).then(setChat).catch(e => setError(e.message)) }, [view, token])

  async function authenticate(event) {
    event.preventDefault(); setError(''); setBusy(true)
    const form = new FormData(event.currentTarget)
    try {
      const result = await request(`/auth/${authMode}`, { method: 'POST', body: Object.fromEntries(form) })
      const next = { token: result.access_token, user: result.user }; localStorage.setItem(SESSION_KEY, JSON.stringify(next)); setSession(next)
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  async function submitJournal(event) {
    event.preventDefault(); if (journal.trim().length < 3) return setError('Write a little more first.'); setBusy(true); setError('')
    try { const result = await request('/journal', { method: 'POST', token, body: { text: journal } }); setAnalysis(result); setJournal(''); loadDashboard() }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  async function sendChat(event) {
    event.preventDefault(); if (!chatText.trim()) return; const message = chatText; setChatText(''); setBusy(true)
    try { const result = await request('/chat', { method: 'POST', token, body: { text: message } }); setChat(items => [...items, result.user_message, result.reply]) }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  function logout() { localStorage.removeItem(SESSION_KEY); setSession(null); setData({ summary: null, trends: [], distribution: null, history: [] }); setChat([]) }

  if (!session) return showAuth
    ? <Auth mode={authMode} setMode={setAuthMode} error={error} busy={busy} onSubmit={authenticate} />
    : <Landing onStart={() => { setAuthMode('signup'); setShowAuth(true) }} onLogin={() => { setAuthMode('login'); setShowAuth(true) }} />
  return <main className="app-shell"><aside className="sidebar"><a className="brand" href="#dashboard"><span>✦</span> MoodMentor</a><div className="side-user"><div className="avatar">{user.name[0]}</div><div><b>{user.name}</b><small>Your calm space</small></div></div><nav>{Object.keys(pageInfo).map(key => <button key={key} className={view === key ? 'nav-active' : ''} onClick={() => setView(key)}><span>{({ dashboard: '⌂', journal: '✎', studio: '◉', chat: '◌', history: '◷' })[key]}</span>{key}</button>)}</nav><button className="logout" onClick={logout}>Sign out</button></aside><section className="main-content"><header><div><p className="eyebrow">MoodMentor</p><h1>{title[0]}</h1><p className="subtitle">{title[1]}</p></div><div className="header-avatar">{user.name[0]}</div></header>{error && <div className="notice">{error}<button onClick={() => setError('')}>×</button></div>}<View view={view} data={data} journal={journal} setJournal={setJournal} analysis={analysis} busy={busy} submitJournal={submitJournal} chat={chat} chatText={chatText} setChatText={setChatText} sendChat={sendChat} /></section></main>
}

function Landing({ onStart, onLogin }) { return <main className="landing"><nav className="landing-nav"><a className="brand"><span>✦</span> MoodMentor</a><div><button className="nav-login" onClick={onLogin}>Sign in</button><button className="landing-cta" onClick={onStart}>Begin your journey <b>→</b></button></div></nav><section className="hero"><div className="hero-copy"><p className="eyebrow">A GENTLER WAY TO CHECK IN</p><h1>Make space for <em>how you feel.</em></h1><p>Turn everyday reflections into calm, personal insight. MoodMentor helps you notice patterns and take one kind next step.</p><div className="hero-actions"><button className="landing-cta" onClick={onStart}>Start reflecting <b>→</b></button><span>Free to begin · Private by design</span></div><div className="social-proof"><div className="faces"><i>☀</i><i>✿</i><i>☁</i></div><span>A few quiet minutes can change the shape of a day.</span></div></div><div className="hero-art"><div className="sun">☼</div><div className="leaf leaf-one">⌇</div><div className="leaf leaf-two">⌇</div><div className="mood-card"><div><small>TODAY'S LITTLE WIN</small><b>I gave myself a pause.</b></div><span>✦</span></div><div className="insight-card"><span>☻</span><div><small>EMOTIONAL CHECK-IN</small><b>Feeling hopeful</b><i>↗ a little lighter today</i></div></div></div></section><section className="landing-features"><p className="eyebrow">BUILT FOR YOUR REAL LIFE</p><h2>Small rituals. Clearer days.</h2><div className="feature-grid"><Feature icon="✎" title="Reflect without pressure" text="A private place to name what is true for you — one sentence is enough." /><Feature icon="⌁" title="Notice your patterns" text="See gentle mood trends over time, without turning your feelings into a score." /><Feature icon="✦" title="Find your next small step" text="Receive thoughtful wellness ideas that meet you where you are." /></div></section></main> }
function Feature({ icon: featureIcon, title, text }) { return <article><span>{featureIcon}</span><h3>{title}</h3><p>{text}</p></article> }
function Auth({ mode, setMode, error, busy, onSubmit }) { return <main className="auth-page"><section className="auth-intro"><a className="brand"><span>✦</span> MoodMentor</a><div><p className="eyebrow">YOUR WELLBEING, UNDERSTOOD</p><h1>A quieter place to understand yourself.</h1><p>Reflect, notice emotional patterns, and find small, practical ways forward.</p></div><div className="intro-orb">☀</div></section><section className="auth-card-wrap"><form className="auth-card" onSubmit={onSubmit}><p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'BEGIN YOUR JOURNEY'}</p><h2>{mode === 'login' ? 'Good to see you.' : 'Create your space.'}</h2><p className="muted">{mode === 'login' ? 'Sign in to continue your wellbeing journey.' : 'A few details and your private space is ready.'}</p>{mode === 'signup' && <label>Name<input required minLength="2" name="name" placeholder="Your name" /></label>}<label>Email<input required type="email" name="email" placeholder="you@example.com" /></label><label>Password<input required minLength="6" type="password" name="password" placeholder="At least 6 characters" /></label>{error && <p className="form-error">{error}</p>}<button className="primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in →' : 'Create account →'}</button><p className="switcher">{mode === 'login' ? 'New to MoodMentor?' : 'Already have an account?'} <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p></form></section></main> }

function View(props) { if (props.view === 'journal') return <Journal {...props} />; if (props.view === 'studio') return <MoodStudio />; if (props.view === 'chat') return <Chat {...props} />; if (props.view === 'history') return <History {...props} />; return <Dashboard {...props} /> }
function Dashboard({ data }) { const summary = data.summary; const dist = data.distribution?.dominant_counts || {}; const leading = summary?.most_frequent_emotion; return <><section className="welcome"><div><p className="eyebrow">TODAY'S CHECK-IN</p><h2>How are you feeling, really?</h2><p>There is no right answer. A few honest words are enough.</p><a href="#" className="primary">Write a reflection →</a></div><div className="welcome-mood"><span>{leading ? icon(leading) : '🌿'}</span><b>{leading ? `${leading} has been showing up` : 'A calm moment for you'}</b><small>{summary?.total_entries ? `${summary.total_entries} reflections recorded` : 'Your journey starts with one check-in.'}</small></div></section><section className="stats"><Stat value={summary?.streak_days ?? '–'} label="Day streak" detail="Keep showing up" /><Stat value={summary?.total_entries ?? '–'} label="Reflections" detail="Moments of clarity" /><Stat value={leading ? icon(leading) : '–'} label="Common feeling" detail={leading || 'Not enough data yet'} /><Stat value={summary?.trend === 'improving' ? '↗' : summary?.trend === 'declining' ? '↘' : '→'} label="Recent trend" detail={summary?.trend || 'steady'} /></section><section className="grid-two"><article className="panel chart-panel"><div className="panel-head"><div><p className="eyebrow">MOOD RHYTHM</p><h3>Your last 30 days</h3></div><span className="badge">valence</span></div><div className="chart">{data.trends.length ? <ResponsiveContainer><AreaChart data={data.trends}><defs><linearGradient id="mood" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#7566ee" stopOpacity=".32"/><stop offset="1" stopColor="#7566ee" stopOpacity="0"/></linearGradient></defs><CartesianGrid vertical={false} stroke="#edf0f7"/><XAxis dataKey="date" tickFormatter={d => d.slice(5)} tickLine={false} axisLine={false}/><YAxis domain={[-1, 1]} tickLine={false} axisLine={false}/><Tooltip/><Area type="monotone" dataKey="avg_valence" stroke="#6956e8" strokeWidth={3} fill="url(#mood)" /></AreaChart></ResponsiveContainer> : <Empty text="Your mood rhythm will appear after your first reflection." />}</div></article><article className="panel"><p className="eyebrow">EMOTIONAL MIX</p><h3>What has been present</h3><div className="emotion-list">{Object.keys(dist).length ? Object.entries(dist).sort((a,b) => b[1]-a[1]).slice(0,5).map(([name, count]) => <div key={name}><span>{icon(name)} {name}</span><div className="meter"><i style={{ width: `${count / Math.max(...Object.values(dist)) * 100}%` }} /></div><b>{count}</b></div>) : <Empty text="Your emotional mix will grow with each check-in." />}</div></article></section><article className="panel recent"><div className="panel-head"><div><p className="eyebrow">RECENT REFLECTIONS</p><h3>Moments you have named</h3></div></div>{data.history.length ? data.history.map(entry => <Reflection key={entry.id} entry={entry} />) : <Empty text="Your reflections will live here, privately." />}</article></> }
function Stat({ value, label, detail }) { return <article className="stat"><strong>{value}</strong><div><b>{label}</b><small>{detail}</small></div></article> }
function Journal({ journal, setJournal, submitJournal, analysis, busy }) { const [activity, setActivity] = useState(null); return <><section className="journal-layout"><article className="panel write-panel"><p className="eyebrow">PRIVATE REFLECTION</p><h2>What is on your mind?</h2><p className="muted">Write without editing yourself. This is a space just for you.</p><form onSubmit={submitJournal}><textarea value={journal} onChange={e => setJournal(e.target.value)} maxLength="5000" placeholder="Today I have been feeling…" /><div className="form-footer"><small>{journal.length} / 5000</small><button className="primary" disabled={busy}>{busy ? 'Understanding…' : 'Understand this reflection →'}</button></div></form></article><article className="panel result-panel">{analysis ? <><div className="result-main"><span>{icon(analysis.dominant_emotion)}</span><div><p className="eyebrow">YOU MAY BE FEELING</p><h2>{analysis.dominant_emotion}</h2><p>{Math.round(analysis.confidence * 100)}% confidence · valence {analysis.valence_score}</p></div></div><p className="ai-reply">{analysis.ai_reply}</p><h3>Small ways to support yourself</h3>{analysis.recommendations.map(r => <div className="recommendation" key={r.id}><span>{r.activity.type === 'breathing' ? '🌬' : '✨'}</span><div><b>{r.activity.title}</b><p>{r.activity.description}</p><small>{r.activity.duration_minutes} minutes · <button onClick={() => setActivity(r.activity)}>View guide →</button></small></div></div>)}</> : <Empty text="After you reflect, your emotional insights and suggested next steps will appear here." />}</article></section>{activity && <ActivityModal activity={activity} onClose={() => setActivity(null)} />}</> }
function activityDestination(activity) { const q = encodeURIComponent(activity.title); if (activity.type === 'music') return [`https://open.spotify.com/search/${q}`, 'Open in Spotify']; if (['breathing', 'meditation', 'mindfulness'].includes(activity.type)) return [`https://www.youtube.com/results?search_query=${encodeURIComponent(`${activity.title} guided practice`)}`, 'Play guided practice']; if (activity.type === 'physical') return [`https://www.youtube.com/results?search_query=${encodeURIComponent(`${activity.title} beginner workout`)}`, 'Start movement']; if (activity.type === 'nature') return ['https://www.google.com/maps/search/park+near+me', 'Find a nearby green space']; if (activity.type === 'social') return [`sms:?body=${encodeURIComponent('Hi, I was thinking of you. Would you like to talk?')}`, 'Send a message']; return [null, 'Use this prompt'] }
function ActivityModal({ activity, onClose }) { const [game, setGame] = useState(null); const [url, label] = activityDestination(activity); const steps = activity.content.split(/(?<=[.!?])\s+/).filter(Boolean); const colors = ['violet', 'mint', 'coral', 'gold', 'sky']; const startGame = () => setGame(colors[Math.floor(Math.random() * colors.length)]); return <div className="modal-backdrop" onMouseDown={onClose}><article className="activity-modal" onMouseDown={e => e.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button><p className="eyebrow">{activity.type} ACTIVITY · {activity.duration_minutes} MIN</p><h2>{activity.title}</h2><p className="muted">{activity.description}</p>{activity.type === 'game' ? <div className="focus-game"><p>{game ? <>Tap the <b>{game}</b> circle</> : 'A tiny reset for a busy mind.'}</p><div>{colors.sort(() => Math.random() - .5).map(color => <button key={color} className={color} onClick={() => game && setGame(color === game ? 'Nice — you found it. Take one more slow breath.' : game)}> </button>)}</div>{!game && <button className="primary" onClick={startGame}>Start focus reset</button>}</div> : <ol>{steps.map((step, index) => <li key={index}>{step}</li>)}</ol>}{url && <a className="primary activity-link" href={url} target="_blank" rel="noreferrer">{label} ↗</a>}</article></div> }
const studioFilters = [
  { id: 'natural', name: 'Natural', icon: '☼', note: 'Just you, as you are.' },
  { id: 'calm', name: 'Calm tide', icon: '◌', note: 'Cool tones for a softer pause.' },
  { id: 'glow', name: 'Golden hour', icon: '✦', note: 'Warm light for a little lift.' },
  { id: 'focus', name: 'Focus', icon: '⌁', note: 'A clear, quiet frame for now.' },
  { id: 'joy', name: 'Joy spark', icon: '✿', note: 'A playful reminder to notice good.' },
]

function MoodStudio() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraState, setCameraState] = useState('idle')
  const [selected, setSelected] = useState('calm')
  const [breathing, setBreathing] = useState(false)
  const [breathText, setBreathText] = useState('Take a small pause')
  const current = studioFilters.find(filter => filter.id === selected)

  useEffect(() => () => streamRef.current?.getTracks().forEach(track => track.stop()), [])

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) { setCameraState('unsupported'); return }
    setCameraState('loading')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      setCameraState('ready')
    } catch { setCameraState('denied') }
  }

  function stopCamera() { streamRef.current?.getTracks().forEach(track => track.stop()); streamRef.current = null; if (videoRef.current) videoRef.current.srcObject = null; setCameraState('idle') }
  function captureMoment() {
    const video = videoRef.current
    if (!video?.videoWidth) return
    const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight
    const context = canvas.getContext('2d'); context.filter = selected === 'calm' ? 'saturate(.78) hue-rotate(155deg)' : selected === 'glow' ? 'sepia(.28) saturate(1.16) brightness(1.07)' : selected === 'focus' ? 'contrast(1.12) saturate(.72)' : selected === 'joy' ? 'saturate(1.25) brightness(1.07)' : 'none'
    context.drawImage(video, 0, 0)
    const link = document.createElement('a'); link.download = `moodmentor-${selected}-moment.png`; link.href = canvas.toDataURL('image/png'); link.click()
  }
  function beginBreathing() {
    setBreathing(true); setBreathText('Breathe in · 4')
    window.setTimeout(() => setBreathText('Hold · 4'), 4000)
    window.setTimeout(() => setBreathText('Breathe out · 6'), 8000)
    window.setTimeout(() => { setBreathText('You gave yourself a pause.'); setBreathing(false) }, 14000)
  }

  return <section className="studio-layout"><article className="studio-stage"><div className={`camera-frame filter-${selected}`}><video ref={videoRef} autoPlay muted playsInline className={cameraState === 'ready' ? 'camera-on' : ''} /><div className="camera-placeholder"><span>{cameraState === 'loading' ? '◌' : '✦'}</span><h2>{cameraState === 'idle' ? 'A moment for you.' : cameraState === 'loading' ? 'Opening your camera…' : cameraState === 'denied' ? 'Camera permission is needed.' : cameraState === 'unsupported' ? 'Camera is not supported here.' : ''}</h2>{cameraState !== 'ready' && <p>{cameraState === 'denied' ? 'Allow camera access in your browser settings, then try again.' : 'Mood Studio is private: your camera stays on this device.'}</p>}</div>{cameraState === 'ready' && <><div className="live-pill"><i /> Private live view</div><div className="filter-label"><span>{current.icon}</span><div><small>YOUR MOOD LENS</small><b>{current.name}</b></div></div></>}</div><div className="studio-controls">{cameraState === 'ready' ? <><button className="camera-action secondary" onClick={stopCamera}>Turn off camera</button><button className="camera-shutter" onClick={captureMoment} aria-label="Save a private snapshot"><i /></button><button className="camera-action" onClick={captureMoment}>Save moment</button></> : <button className="studio-start" onClick={startCamera} disabled={cameraState === 'loading'}>{cameraState === 'loading' ? 'Opening camera…' : 'Enable my camera'} <b>→</b></button>}</div></article><aside className="studio-panel"><div><p className="eyebrow">CHOOSE YOUR LENS</p><h2>Set the tone for this moment.</h2><p className="muted">These filters are visual only. They do not read, store, or diagnose your emotions.</p></div><div className="lens-list">{studioFilters.map(filter => <button key={filter.id} className={selected === filter.id ? 'lens-selected' : ''} onClick={() => setSelected(filter.id)}><span>{filter.icon}</span><div><b>{filter.name}</b><small>{filter.note}</small></div><i>{selected === filter.id ? '✓' : ''}</i></button>)}</div><div className={`breath-card ${breathing ? 'breathing' : ''}`}><div className="breath-orb">{breathing ? '◌' : '⌁'}</div><div><small>30-SECOND RESET</small><b>{breathText}</b><p>Let your shoulders drop. There is nowhere else you need to be.</p></div><button onClick={beginBreathing} disabled={breathing}>{breathing ? 'Breathing…' : 'Begin'}</button></div><p className="studio-privacy">⌁ Your video never leaves this browser. Saved moments download only to your device.</p></aside></section>
}
function Chat({ chat, chatText, setChatText, sendChat, busy }) { return <article className="panel chat-panel"><div className="chat-log">{chat.length ? chat.map(message => <div key={message.id} className={`message ${message.role}`}><p>{message.text}</p>{message.emotion && <small>{icon(message.emotion)} detected: {message.emotion}</small>}</div>) : <div className="chat-welcome"><span>✦</span><h2>I’m here to listen.</h2><p>What feels important to talk through today?</p></div>}</div><form className="chat-form" onSubmit={sendChat}><input value={chatText} onChange={e => setChatText(e.target.value)} placeholder="Share what is on your mind…" /><button className="primary" disabled={busy}>Send</button></form></article> }
function History({ data }) { return <section className="history-list">{data.history.length ? data.history.map(entry => <article className="panel" key={entry.id}><Reflection entry={entry} full /></article>) : <article className="panel"><Empty text="No reflections yet. Your story can begin whenever you are ready." /></article>}</section> }
function Reflection({ entry, full }) { return <div className="reflection"><span>{icon(entry.dominant_emotion)}</span><div><div className="reflection-head"><b>{entry.dominant_emotion}</b><time>{new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time></div><p>{full ? entry.text : `${entry.text.slice(0, 150)}${entry.text.length > 150 ? '…' : ''}`}</p><small>{Math.round(entry.confidence * 100)}% confidence · valence {entry.valence_score}</small></div></div> }
function Empty({ text }) { return <div className="empty"><span>🌱</span><p>{text}</p></div> }
