import { icon } from '../../App'

export default function Reflection({ entry, full }) {
  return (
    <div className="reflection">
      <span>{icon(entry.dominant_emotion)}</span>
      <div>
        <div className="reflection-head">
          <b>{entry.dominant_emotion}</b>
          <time>{new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
        </div>
        <p>{full ? entry.text : `${entry.text.slice(0, 150)}${entry.text.length > 150 ? '…' : ''}`}</p>
        <small>{Math.round(entry.confidence * 100)}% confidence · valence {entry.valence_score}</small>
      </div>
    </div>
  )
}
