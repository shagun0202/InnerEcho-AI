import { useState, useEffect, useRef } from 'react'
import { Button, Icon, Badge } from './ui'

export default function MoodGames({ onComplete }) {
  const [activeGame, setActiveGame] = useState('bubble')

  const games = [
    { id: 'bubble', name: 'Breath Bubbles', icon: 'spark', desc: 'Rhythmic breath-guided bubbles' },
    { id: 'zen', name: 'Zen Garden', icon: 'leaf', desc: 'Rake patterns in calming sand' },
    { id: 'memory', name: 'Gentle Focus', icon: 'sun', desc: 'Relaxed nature tile matching' },
    { id: 'harmony', name: 'Emotion Harmony', icon: 'journal', desc: 'Mindful words to grounded haiku' },
  ]

  return (
    <div className="mood-games-container">
      <div className="game-selector" role="tablist" aria-label="Wellness mini-games">
        {games.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={activeGame === g.id}
            className={`game-tab ${activeGame === g.id ? 'active' : ''}`}
            onClick={() => setActiveGame(g.id)}
          >
            <Icon name={g.icon} size={16} />
            <span>{g.name}</span>
          </button>
        ))}
      </div>

      <div className="game-stage" role="tabpanel">
        {activeGame === 'bubble' && <BreathBubbleGame />}
        {activeGame === 'zen' && <ZenGardenGame />}
        {activeGame === 'memory' && <MemoryTilesGame />}
        {activeGame === 'harmony' && <EmotionHarmonyGame />}
      </div>

      {onComplete && (
        <div className="game-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Button onClick={onComplete}>Finish Game Break</Button>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Game 1: Breath Bubbles (Calming rhythm + gentle affirmations)
   ───────────────────────────────────────────────────────────── */
function BreathBubbleGame() {
  const [phase, setPhase] = useState('Inhale')
  const [poppedCount, setPoppedCount] = useState(0)
  const [affirmation, setAffirmation] = useState('Let your shoulders soften.')

  const affirmations = [
    'Let your shoulders soften.',
    'This moment is yours.',
    'There is no rush right now.',
    'Notice the rhythm of your breath.',
    'You are doing enough.',
    'Inhale peace, exhale tension.',
  ]

  useEffect(() => {
    const cycle = setInterval(() => {
      setPhase((prev) => (prev === 'Inhale' ? 'Exhale' : 'Inhale'))
    }, 4000)
    return () => clearInterval(cycle)
  }, [])

  const popBubble = () => {
    setPoppedCount((c) => c + 1)
    setAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)])
  }

  return (
    <div className="breath-bubble-game" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <p className="eyebrow" aria-live="polite">BREATH PACER · {phase.toUpperCase()}</p>
      <div
        className={`breath-orb ${phase.toLowerCase()}`}
        onClick={popBubble}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            popBubble()
          }
        }}
        aria-label={`Breathing circle, currently in ${phase} phase. Click or press space to pop for a mindful note.`}
        style={{
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          margin: '1.5rem auto',
          background: 'radial-gradient(circle, #e9d5ff 0%, #c084fc 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 4s ease-in-out',
          transform: phase === 'Inhale' ? 'scale(1.25)' : 'scale(0.85)',
          boxShadow: '0 8px 32px rgba(192, 132, 252, 0.35)',
        }}
      >
        <span style={{ fontWeight: 600, color: '#4a044e' }}>{phase}</span>
      </div>
      <p style={{ fontStyle: 'italic', color: 'var(--muted)', minHeight: '2rem' }}>
        "{affirmation}"
      </p>
      <small style={{ display: 'block', marginTop: '1rem', color: 'var(--muted)' }}>
        Tap orb or press Space · Gentle pops: {poppedCount}
      </small>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Game 2: Zen Sand Garden (Interactive raking grid)
   ───────────────────────────────────────────────────────────── */
function ZenGardenGame() {
  const [grid, setGrid] = useState(() => Array(16).fill(0))

  const rake = (index) => {
    setGrid((prev) => {
      const next = [...prev]
      next[index] = (next[index] + 1) % 4
      return next
    })
  }

  const resetGarden = () => setGrid(Array(16).fill(0))

  const patterns = ['—', '∼', '≈', '𖡡']

  return (
    <div className="zen-garden-game" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
      <p className="eyebrow">ZEN RAKE · TOUCH OR TAB THROUGH TILES</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          maxWidth: '320px',
          margin: '1.5rem auto',
          padding: '12px',
          background: '#fef3c7',
          borderRadius: '16px',
          border: '2px solid #fde68a',
        }}
      >
        {grid.map((val, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => rake(idx)}
            aria-label={`Zen tile ${idx + 1}, pattern ${patterns[val]}`}
            style={{
              height: '60px',
              borderRadius: '10px',
              border: '1px dashed #d97706',
              background: '#fffbeb',
              fontSize: '1.5rem',
              color: '#b45309',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            {patterns[val]}
          </button>
        ))}
      </div>
      <Button variant="secondary" onClick={resetGarden}>Smooth Sand</Button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Game 3: Memory Focus (No pressure nature pair matching)
   ───────────────────────────────────────────────────────────── */
function MemoryTilesGame() {
  const ICONS = ['🌱', '☀️', '💧', '🌸', '🌙', '⭐']
  const [deck, setDeck] = useState(() =>
    [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, id) => ({ id, icon, flipped: false, matched: false }))
  )
  const [selected, setSelected] = useState([])
  const [matches, setMatches] = useState(0)

  const flipTile = (index) => {
    if (selected.length === 2 || deck[index].flipped || deck[index].matched) return
    const nextDeck = [...deck]
    nextDeck[index].flipped = true
    setDeck(nextDeck)

    const nextSelected = [...selected, index]
    setSelected(nextSelected)

    if (nextSelected.length === 2) {
      const [i1, i2] = nextSelected
      if (deck[i1].icon === deck[i2].icon) {
        setTimeout(() => {
          setDeck((d) => {
            const updated = [...d]
            updated[i1].matched = true
            updated[i2].matched = true
            return updated
          })
          setSelected([])
          setMatches((m) => m + 1)
        }, 500)
      } else {
        setTimeout(() => {
          setDeck((d) => {
            const updated = [...d]
            updated[i1].flipped = false
            updated[i2].flipped = false
            return updated
          })
          setSelected([])
        }, 900)
      }
    }
  }

  const resetDeck = () => {
    setDeck(
      [...ICONS, ...ICONS]
        .sort(() => Math.random() - 0.5)
        .map((icon, id) => ({ id, icon, flipped: false, matched: false }))
    )
    setSelected([])
    setMatches(0)
  }

  return (
    <div className="memory-tiles-game" style={{ textAlign: 'center', padding: '1rem' }}>
      <p className="eyebrow">GENTLE FOCUS · NO TIMERS · TAKE YOUR TIME</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          maxWidth: '300px',
          margin: '1.25rem auto',
        }}
      >
        {deck.map((card, idx) => (
          <button
            key={card.id}
            type="button"
            onClick={() => flipTile(idx)}
            aria-label={`Tile ${idx + 1}, ${card.flipped || card.matched ? card.icon : 'hidden'}`}
            style={{
              height: '64px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              background: card.matched ? '#dcfce7' : card.flipped ? '#f3e8ff' : 'var(--surface)',
              fontSize: '1.75rem',
              cursor: card.matched ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {card.flipped || card.matched ? card.icon : '✳'}
          </button>
        ))}
      </div>
      {matches === 6 ? (
        <p style={{ color: '#16a34a', fontWeight: 600 }}>All matched! Peace found in small steps.</p>
      ) : (
        <small style={{ color: 'var(--muted)' }}>Pairs found: {matches} of 6</small>
      )}
      <div style={{ marginTop: '0.75rem' }}>
        <Button variant="secondary" onClick={resetDeck}>Shuffle Tiles</Button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Game 4: Emotion Harmony (Word reflection to Haiku)
   ───────────────────────────────────────────────────────────── */
function EmotionHarmonyGame() {
  const WORDS = [
    { word: 'Quiet', category: 'peace' },
    { word: 'Stillness', category: 'peace' },
    { word: 'Breathe', category: 'body' },
    { word: 'Heartbeat', category: 'body' },
    { word: 'Horizon', category: 'nature' },
    { word: 'Morning light', category: 'nature' },
    { word: 'Safe', category: 'ground' },
    { word: 'Grounded', category: 'ground' },
  ]

  const [picked, setPicked] = useState([])

  const toggleWord = (word) => {
    setPicked((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : prev.length < 3 ? [...prev, word] : prev
    )
  }

  return (
    <div className="emotion-harmony-game" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
      <p className="eyebrow">MIND HARMONY · CHOOSE 3 WORDS THAT RESONATE</p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
          margin: '1.5rem auto',
          maxWidth: '360px',
        }}
      >
        {WORDS.map((item) => {
          const active = picked.includes(item.word)
          return (
            <button
              key={item.word}
              type="button"
              className={active ? 'selected' : ''}
              aria-pressed={active}
              onClick={() => toggleWord(item.word)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: active ? '2px solid #a855f7' : '1px solid var(--border)',
                background: active ? '#f3e8ff' : 'var(--surface)',
                color: active ? '#6b21a8' : 'var(--ink)',
                cursor: 'pointer',
                fontWeight: active ? 600 : 400,
              }}
            >
              {item.word}
            </button>
          )
        })}
      </div>

      {picked.length === 3 ? (
        <div
          style={{
            background: 'var(--surface-alt)',
            padding: '1rem',
            borderRadius: '12px',
            maxWidth: '320px',
            margin: '0 auto',
            border: '1px solid var(--border)',
          }}
        >
          <Badge>Your Reflection</Badge>
          <p style={{ margin: '8px 0 0', fontStyle: 'italic' }}>
            "{picked[0]}, like morning dew,<br />
            {picked[1]} guides the quiet step,<br />
            {picked[2]} greets the day."
          </p>
        </div>
      ) : (
        <small style={{ color: 'var(--muted)' }}>Select {3 - picked.length} more word{3 - picked.length === 1 ? '' : 's'}</small>
      )}
    </div>
  )
}
