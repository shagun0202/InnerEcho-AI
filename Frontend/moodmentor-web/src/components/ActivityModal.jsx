import { useState } from 'react'

function activityDestination(activity) {
  const q = encodeURIComponent(activity.title)
  if (activity.type === 'music') return [`https://open.spotify.com/search/${q}`, 'Open in Spotify']
  if (['breathing', 'meditation', 'mindfulness'].includes(activity.type)) return [`https://www.youtube.com/results?search_query=${encodeURIComponent(`${activity.title} guided practice`)}`, 'Play guided practice']
  if (activity.type === 'physical') return [`https://www.youtube.com/results?search_query=${encodeURIComponent(`${activity.title} beginner workout`)}`, 'Start movement']
  if (activity.type === 'nature') return ['https://www.google.com/maps/search/park+near+me', 'Find a nearby green space']
  if (activity.type === 'social') return [`sms:?body=${encodeURIComponent('Hi, I was thinking of you. Would you like to talk?')}`, 'Send a message']
  return [null, 'Use this prompt']
}

export default function ActivityModal({ activity, onClose }) {
  const [game, setGame] = useState(null)
  const [url, label] = activityDestination(activity)
  const steps = activity.content.split(/(?<=[.!?])\s+/).filter(Boolean)
  const colors = ['violet', 'mint', 'coral', 'gold', 'sky']
  
  const startGame = () => setGame(colors[Math.floor(Math.random() * colors.length)])

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <article className="activity-modal" onMouseDown={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <p className="eyebrow">{activity.type} ACTIVITY · {activity.duration_minutes} MIN</p>
        <h2>{activity.title}</h2>
        <p className="muted">{activity.description}</p>
        
        {activity.type === 'game' ? (
          <div className="focus-game">
            <p>{game ? <>Tap the <b>{game}</b> circle</> : 'A tiny reset for a busy mind.'}</p>
            <div>
              {[...colors].sort(() => Math.random() - .5).map(color => (
                <button 
                  key={color} 
                  className={color} 
                  onClick={() => game && setGame(color === game ? 'Nice — you found it. Take one more slow breath.' : game)}
                > </button>
              ))}
            </div>
            {!game && <button className="primary" onClick={startGame}>Start focus reset</button>}
          </div>
        ) : (
          <ol>
            {steps.map((step, index) => <li key={index}>{step}</li>)}
          </ol>
        )}
        
        {url && <a className="primary activity-link" href={url} target="_blank" rel="noreferrer">{label} ↗</a>}
      </article>
    </div>
  )
}
