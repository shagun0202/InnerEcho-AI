import Feature from './common/Feature'

export default function Landing({ onStart, onLogin }) {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <a className="brand"><span>✦</span> MoodMentor</a>
        <div>
          <button className="nav-login" onClick={onLogin}>Sign in</button>
          <button className="landing-cta" onClick={onStart}>Begin your journey <b>→</b></button>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A GENTLER WAY TO CHECK IN</p>
          <h1>Make space for <em>how you feel.</em></h1>
          <p>Turn everyday reflections into calm, personal insight. MoodMentor helps you notice patterns and take one kind next step.</p>
          <div className="hero-actions">
            <button className="landing-cta" onClick={onStart}>Start reflecting <b>→</b></button>
            <span>Free to begin · Private by design</span>
          </div>
          <div className="social-proof">
            <div className="faces"><i>☀</i><i>✿</i><i>☁</i></div>
            <span>A few quiet minutes can change the shape of a day.</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="sun">☼</div>
          <div className="leaf leaf-one">⌇</div>
          <div className="leaf leaf-two">⌇</div>
          <div className="mood-card">
            <div>
              <small>TODAY'S LITTLE WIN</small>
              <b>I gave myself a pause.</b>
            </div>
            <span>✦</span>
          </div>
          <div className="insight-card">
            <span>☻</span>
            <div>
              <small>EMOTIONAL CHECK-IN</small>
              <b>Feeling hopeful</b>
              <i>↗ a little lighter today</i>
            </div>
          </div>
        </div>
      </section>
      <section className="landing-features">
        <p className="eyebrow">BUILT FOR YOUR REAL LIFE</p>
        <h2>Small rituals. Clearer days.</h2>
        <div className="feature-grid">
          <Feature icon="✎" title="Reflect without pressure" text="A private place to name what is true for you — one sentence is enough." />
          <Feature icon="⌁" title="Notice your patterns" text="See gentle mood trends over time, without turning your feelings into a score." />
          <Feature icon="✦" title="Find your next small step" text="Receive thoughtful wellness ideas that meet you where you are." />
        </div>
      </section>
    </main>
  )
}
