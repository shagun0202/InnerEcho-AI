import { Component, useEffect, useRef, useId } from 'react'

const paths = {
  stop: 'M6 6h12v12H6V6',
  volume: 'M3 9h4l5-5v16l-5-5H3V9 M16 8a6 6 0 010 8 M19 4a11 11 0 010 16',
  mic: 'M9 5a3 3 0 016 0v7a3 3 0 01-6 0V5 M5 10v2a7 7 0 0014 0v-2 M12 19v3 M8 22h8',
  music:
    'M9 18V5l11-2v13 M9 8l11-2 M9 18a3 3 0 11-6 0a3 3 0 016 0 M20 16a3 3 0 11-6 0a3 3 0 016 0',
  camera: 'M3 6h5l2-3h4l2 3h5v15H3V6 M12 9a4 4 0 100 8a4 4 0 000-8',
  pin: 'M12 22S4 14 4 9a8 8 0 1116 0c0 5-8 13-8 13 M12 6a3 3 0 100 6a3 3 0 000-6',
  phone: 'M7 3H3c0 10 8 18 18 18v-4l-5-2-2 2a14 14 0 01-7-7l2-2-2-5',
  game: 'M6 7h12l4 12-4 1-4-4h-4l-4 4-4-1L6 7 M6 11h6 M9 8v6 M16 10h1 M18 13h1',
  photo: 'M3 3h18v18H3V3 M3 17l6-7 5 5 3-3 4 5 M15 6h1',
  plus: 'M12 4v16 M4 12h16',
  panel: 'M3 3h18v18H3V3 M9 3v18 M13 9l3 3-3 3',
  home: 'M3 10l9-7 9 7v10H3V10 M9 20v-7h6v7',
  journal: 'M5 3h12a2 2 0 012 2v16H5a2 2 0 010-4h14 M5 3v14 M9 7h6 M9 11h6',
  chat: 'M4 4h16v12H9l-5 4V4 M8 8h8 M8 12h5',
  meditation:
    'M12 3v3 M3 12h3 M18 12h3 M5 5l2 2 M17 7l2-2 M6 20c0-8 12-8 12 0 M9 12a3 3 0 106 0a3 3 0 10-6 0',
  wellness: 'M12 20S2 14 2 8a5 5 0 0110-1A5 5 0 0122 8c0 6-10 12-10 12',
  insights: 'M4 20V4 M4 20h17 M8 15l4-5 4 2 5-8',
  history: 'M3 11a9 9 0 119 10 M3 3v8h8 M12 7v6l4 2',
  team: 'M8 11a4 4 0 100-8a4 4 0 100 8 M2 21v-3a6 6 0 0112 0v3 M17 4a4 4 0 010 7 M18 15a5 5 0 014 5v1',
  profile: 'M12 12a4 4 0 100-8a4 4 0 100 8 M4 21v-2a8 8 0 0116 0v2',
  settings:
    'M12 8a4 4 0 100 8a4 4 0 100-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',
  arrow: 'M4 12h16 M14 6l6 6-6 6',
  spark: 'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7',
  shield: 'M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4 M8 12l3 3 5-6',
  clock: 'M12 3a9 9 0 100 18a9 9 0 100-18 M12 7v5l3 2',
  play: 'M8 4l12 8-12 8V4',
  close: 'M5 5l14 14 M5 19L19 5',
  moon: 'M20 15A9 9 0 019 3a9 9 0 1011 12',
  sun: 'M12 7a5 5 0 100 10a5 5 0 100-10 M12 1v3 M12 20v3 M1 12h3 M20 12h3',
  bell: 'M5 17h14l-2-3V9a5 5 0 00-10 0v5l-2 3 M10 21h4',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  logout: 'M10 3H4v18h6 M9 12h13 M17 7l5 5-5 5',
  check: 'M4 12l5 5L20 6',
  leaf: 'M5 20c-8-12 6-18 15-17 1 9-3 18-13 14 M3 22L16 9',
}
export function Icon({ name = 'spark', size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.spark} />
    </svg>
  )
}
export function Brand() {
  return (
    <span className="mm-brand">
      <span className="brand-mark">
        <Icon name="leaf" size={21} />
      </span>
      MoodMentor<span className="brand-period">.</span>
    </span>
  )
}
export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}
export function Badge({ children, tone = '' }) {
  return <span className={`mm-badge ${tone}`}>{children}</span>
}
export function Empty({ title = 'A little space to begin', children, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name="leaf" size={28} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  )
}
export function Loading() {
  return (
    <div className="skeleton-grid" aria-label="Loading" role="status">
      <div className="skeleton wide" />
      <div className="skeleton" />
      <div className="skeleton" />
      <span className="sr-only">Loading your space…</span>
    </div>
  )
}
export function ErrorState({ error, retry }) {
  return (
    <div className="error-state" role="alert">
      <h3>We couldn’t load this just yet.</h3>
      <p>{error}</p>
      <Button variant="secondary" onClick={retry}>
        Try again
      </Button>
    </div>
  )
}
export function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  )
}
export function MoodPicker({
  value,
  onChange,
  label = 'How are you feeling?',
}) {
  const labels = ['Very low', 'Low', 'Okay', 'Good', 'Great']
  return (
    <fieldset className="mood-field">
      <legend>{label}</legend>
      <div className="mood-options">
        {labels.map((text, i) => (
          <button
            type="button"
            aria-pressed={value === i + 1}
            className={`mood-option ${value === i + 1 ? 'selected' : ''}`}
            onClick={() => onChange(i + 1)}
            key={text}
          >
            <span className={`mood-face face-${i}`} aria-hidden="true">
              <i />
              <i />
              <b />
            </span>
            <small>{text}</small>
          </button>
        ))}
      </div>
    </fieldset>
  )
}
export function Dialog({ title, children, onClose, wide = false }) {
  const ref = useRef(null),
    id = useId()
  useEffect(() => {
    const node = ref.current
    node.showModal()
    return () => node.close()
  }, [])
  return (
    <dialog
      ref={ref}
      className={`mm-dialog ${wide ? 'dialog-wide' : ''}`}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault()
        onClose?.()
      }}
    >
      <div className="dialog-heading">
        <h2 id={id}>{title}</h2>
        {onClose && (
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        )}
      </div>
      {children}
    </dialog>
  )
}
export function Landscape({ variant = 'sage', className = '' }) {
  const colors =
    variant === 'lavender'
      ? ['#ece8f3', '#d4cce3', '#a598ba', '#776689']
      : variant === 'peach'
        ? ['#f6e8dc', '#ebc8ab', '#c48d70', '#96745e']
        : ['#e5ebe2', '#bdcdb5', '#7f9a7c', '#4b705e']
  return (
    <svg
      className={`landscape ${className}`}
      viewBox="0 0 600 380"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="600" height="380" fill={colors[0]} />
      <circle cx="425" cy="104" r="49" fill="#fffaf0" />
      <path d="M0 262Q110 106 285 230T600 188V380H0Z" fill={colors[1]} />
      <path d="M0 320Q160 180 330 284T600 212V380H0Z" fill={colors[2]} />
      <path d="M0 375Q150 300 310 348T600 284V380H0Z" fill={colors[3]} />
      <path
        d="M340 380Q270 325 380 300T404 250"
        stroke="#f6f0de"
        strokeWidth="5"
        fill="none"
        opacity=".7"
      />
    </svg>
  )
}
export class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <ErrorState
        error="This page encountered an unexpected error."
        retry={() => window.location.reload()}
      />
    ) : (
      this.props.children
    )
  }
}
