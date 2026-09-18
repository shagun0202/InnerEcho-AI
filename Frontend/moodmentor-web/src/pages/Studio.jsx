import MoodStudio from '../components/MoodStudio'
import '../legacy.css'
export default function Studio() {
  return (
    <div className="studio-legacy">
      <div className="page-intro">
        <div>
          <p className="eyebrow">A LOCAL VISUAL RESET</p>
          <h1>Mood Lens</h1>
          <p>
            Camera frames stay in your browser. Enable the camera only when you
            choose.
          </p>
        </div>
      </div>
      <MoodStudio />
    </div>
  )
}
