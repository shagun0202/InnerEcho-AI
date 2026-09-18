import { useState } from 'react'
import { Brand, Button, Icon } from '../components/ui'
import { WellnessPhoto } from '../components/WellnessVisual'

const moments = [
  {
    name: 'Breathe',
    title: 'Find a little quiet.',
    text: 'Guided breathing and meditation to make space between one thing and the next.',
    scene: 'calm',
    tone: 'lilac',
    icon: 'meditation',
  },
  {
    name: 'Connect',
    title: 'Come back to connection.',
    text: 'A gentle nudge to reach out, share a moment, or take a walk together.',
    scene: 'connect',
    tone: 'peach',
    icon: 'team',
  },
  {
    name: 'Reset',
    title: 'Let the day feel lighter.',
    text: 'Small, practical activities chosen around your time, energy, and preferences.',
    scene: 'pause',
    tone: 'lime',
    icon: 'sun',
  },
]

export default function Landing({ onAuth }) {
  const [selected, setSelected] = useState(0)
  const current = moments[selected]
  return (
    <div className="editorial-landing">
      <nav className="editorial-nav" aria-label="Main">
        <a href="#" aria-label="MoodMentor home">
          <Brand />
        </a>
        <div className="editorial-links">
          <a href="#how-it-works">How it works</a>
          <a href="#reset-moments">Reset moments</a>
          <a href="#privacy">Your privacy</a>
        </div>
        <div className="button-row">
          <button className="text-button" onClick={() => onAuth('login')}>
            Sign in
          </button>
          <Button onClick={() => onAuth('signup')}>
            Find your moment <Icon name="arrow" size={17} />
          </Button>
        </div>
      </nav>
      <main>
        <section className="editorial-hero">
          <div className="editorial-hero-copy">
            <p className="eyebrow">
              <span className="tiny-sun">✳</span> A LITTLE MORE YOU IN YOUR
              WORKDAY
            </p>
            <h1>
              A healthier workday.
              <br />
              One <em>small pause</em>
              <br />
              at a time.
            </h1>
            <p className="editorial-lead">
              Some days ask a lot of you. Meet the wellness companion that helps
              you talk it through, find your next step, and discover what feels
              better.
            </p>
            <Button onClick={() => onAuth('signup')}>
              Make room for yourself <Icon name="arrow" />
            </Button>
            <span className="hero-footnote">
              <Icon name="shield" size={15} />
              Private by default. At your own pace.
            </span>
          </div>
          <div className="editorial-hero-art">
            <div className="hero-sunburst" aria-hidden="true">
              ✳
            </div>
            <WellnessPhoto
              eager
              scene="pause"
              alt="Illustrative scene of a woman enjoying a sunlit pause in a garden"
            />
            <div className="hero-caption">
              <span className="caption-icon">
                <Icon name="leaf" />
              </span>
              <div>
                <b>You belong in your day, too.</b>
                <span>A fresh perspective can start with a pause.</span>
              </div>
            </div>
            <span className="floating-word" aria-hidden="true">
              inhale. exhale. begin again.
            </span>
          </div>
        </section>
        <div className="intention-ribbon" aria-label="Ways to reset">
          <span>Breathe deeper</span>
          <i>✳</i>
          <span>Move a little</span>
          <i>✳</i>
          <span>Feel connected</span>
          <i>✳</i>
          <span>Make room for you</span>
        </div>
        <section className="editorial-story" id="how-it-works">
          <div>
            <p className="eyebrow">WELLNESS THAT STARTS WITH LISTENING</p>
            <h2>
              You don’t need another
              <br />
              thing on your list.
              <br />
              <em>You need a moment.</em>
            </h2>
          </div>
          <div className="editorial-story-body">
            <p>
              Start with what’s on your mind. MoodMentor connects your
              conversation to a practical reset, then learns from what you tell
              us afterward.
            </p>
            <ol className="editorial-steps">
              <li>
                <span>01</span>
                <div>
                  <h3>Tell us how it feels.</h3>
                  <p>
                    A busy mind, a good moment, a difficult day. Start anywhere.
                  </p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>Choose your next small step.</h3>
                  <p>
                    Find a reset that fits your time and energy. You’re in
                    control.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>Discover what helps you.</h3>
                  <p>
                    Your before-and-after feedback shapes future suggestions.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>
        <section
          className={`editorial-moments tone-${current.tone}`}
          id="reset-moments"
        >
          <div className="moments-heading">
            <div>
              <p className="eyebrow">MEET YOUR RESET MOMENTS</p>
              <h2>
                A change of pace.
                <br />
                <em>A little more possibility.</em>
              </h2>
            </div>
            <p>
              Quiet, movement, connection.
              <br />
              There’s more than one way to feel refreshed.
            </p>
          </div>
          <div className="moment-tabs" aria-label="Explore reset categories">
            {moments.map((m, i) => (
              <button
                key={m.name}
                aria-pressed={selected === i}
                onClick={() => setSelected(i)}
              >
                <Icon name={m.icon} />
                {m.name}
              </button>
            ))}
          </div>
          <div className="moment-feature">
            <WellnessPhoto
              key={current.scene}
              scene={current.scene}
              alt={
                current.scene === 'calm'
                  ? 'A quiet lake under a pastel dawn sky'
                  : current.scene === 'connect'
                    ? 'Illustrative scene of two friends walking through a leafy park'
                    : 'Illustrative scene of a peaceful outdoor break'
              }
            />
            <div>
              <span className="moment-doodle" aria-hidden="true">
                {selected === 0 ? '◌' : selected === 1 ? '✺' : '✳'}
              </span>
              <h3>{current.title}</h3>
              <p>{current.text}</p>
              <Button onClick={() => onAuth('signup')}>
                Explore your resets <Icon name="arrow" size={18} />
              </Button>
              <small>Actual activities. Your own feedback. No pressure.</small>
            </div>
          </div>
        </section>
        <section className="conversation-story">
          <div
            className="conversation-preview"
            aria-label="Illustrative conversation preview"
          >
            <span className="preview-label">AN EXAMPLE MOMENT</span>
            <p className="example-message">
              Meetings all day. My mind needs a break.
            </p>
            <div className="example-response">
              <span className="companion-sign">✳</span>
              <p>
                That sounds like a full day. A short breathing reset could give
                you a little space between tasks.
              </p>
            </div>
            <div className="example-reset">
              <WellnessPhoto scene="calm" />
              <div>
                <span>YOUR NEXT STEP</span>
                <h3>A little room to breathe</h3>
                <p>3 minutes · Guided breathing</p>
              </div>
              <Icon name="play" />
            </div>
          </div>
          <div>
            <p className="eyebrow">A COMPANION, WITH A NEXT STEP</p>
            <h2>
              Good conversation.
              <br />
              <em>Something you can do.</em>
            </h2>
            <p>
              Reflect in your own words, explore an activity, and come back to
              the conversation. Everything connects in one personal space.
            </p>
            <button
              className="editorial-text-link"
              onClick={() => onAuth('signup')}
            >
              Meet your companion <Icon name="arrow" />
            </button>
          </div>
        </section>
        <section className="editorial-privacy" id="privacy">
          <div className="privacy-flower" aria-hidden="true">
            ✺
          </div>
          <div>
            <p className="eyebrow">YOUR SPACE MEANS YOUR SPACE</p>
            <h2>
              Feeling better starts
              <br />
              with feeling <em>safe to be you.</em>
            </h2>
            <p>
              Your journal and conversation stay in your private account.
              Optional AI sharing is your choice. Your employer cannot see your
              personal wellness history.
            </p>
            <div className="privacy-promises">
              <span>
                <Icon name="shield" />
                Private reflections
              </span>
              <span>
                <Icon name="check" />
                Clear choices
              </span>
              <span>
                <Icon name="profile" />
                You’re in control
              </span>
            </div>
            <small>
              A wellness companion, not medical care. Human-support resources
              are always available.
            </small>
          </div>
        </section>
        <section className="editorial-final">
          <WellnessPhoto
            scene="connect"
            alt="Illustrative scene of friends finding a moment of connection outdoors"
          />
          <div>
            <p className="eyebrow">THE REST OF YOUR DAY STARTS HERE</p>
            <h2>
              Make a little
              <br />
              <em>room for you.</em>
            </h2>
            <Button onClick={() => onAuth('signup')}>
              Begin with a conversation <Icon name="arrow" />
            </Button>
          </div>
        </section>
      </main>
      <footer className="editorial-footer">
        <Brand />
        <p>Small moments. A healthier workday.</p>
        <a href="#privacy">
          Privacy comes first <Icon name="shield" size={15} />
        </a>
      </footer>
    </div>
  )
}
