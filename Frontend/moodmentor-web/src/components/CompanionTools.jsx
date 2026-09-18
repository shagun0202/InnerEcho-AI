import { lazy, Suspense, useState } from 'react'
import { useResource, navigate } from '../lib/hooks'
import { Button, Dialog, Empty, ErrorState, Icon, Loading } from './ui'
import { WellnessPhoto } from './WellnessVisual'
const Library = lazy(() => import('../pages/Library'))
const Studio = lazy(() => import('../pages/Studio'))
const CommandCenter = lazy(() =>
  import('../pages/Dashboard').then((m) => ({ default: m.CommandCenter })),
)
const MoodGames = lazy(() => import('./MoodGames'))


export const TOOLS = [
  {
    id: 'meditation',
    icon: 'meditation',
    label: 'Meditation',
    description: 'A guided moment of quiet',
    tone: 'lilac',
  },
  {
    id: 'reflection',
    icon: 'journal',
    label: 'Private reflection',
    description: 'Save what’s on your mind',
    tone: 'peach',
  },
  {
    id: 'checkin',
    icon: 'sun',
    label: 'Quick check-in',
    description: 'Mood, energy, and a next step',
    tone: 'yellow',
  },
  {
    id: 'music',
    icon: 'music',
    label: 'Music reset',
    description: 'Find a sound for this moment',
    tone: 'pink',
  },
  {
    id: 'places',
    icon: 'pin',
    label: 'A change of scenery',
    description: 'Search parks, cafés, and more',
    tone: 'lime',
  },
  {
    id: 'people',
    icon: 'phone',
    label: 'Someone you trust',
    description: 'Choose to call your saved contact',
    tone: 'peach',
  },
  {
    id: 'studio',
    icon: 'camera',
    label: 'Mood Lens',
    description: 'Your creative camera break',
    tone: 'yellow',
  },
  {
    id: 'wellness',
    icon: 'wellness',
    label: 'All reset moments',
    description: 'Movement, grounding, focus & play',
    tone: 'lilac',
  },
  {
    id: 'games',
    icon: 'spark',
    label: 'Mindful Games',
    description: '4 accessible, stress-free mini resets',
    tone: 'peach',
  },
]


function TrustedPerson({ onClose }) {
  const contact = useResource('/safety/contact')
  if (contact.loading) return <Loading />
  if (contact.error)
    return <ErrorState error={contact.error} retry={contact.reload} />
  return (
    <div className="people-tool">
      <WellnessPhoto scene="connect" />
      <h3>A little connection can be a good next step.</h3>
      {contact.data ? (
        <>
          <p>
            You chose {contact.data.name} as a trusted{' '}
            {contact.data.relationship_type.toLowerCase()}.
          </p>
          <a className="btn btn-primary" href={`tel:${contact.data.phone}`}>
            <Icon name="phone" />
            Call {contact.data.name}
          </a>
          <p className="quiet-note">
            Opens your calling app. No one has been contacted.
          </p>
        </>
      ) : (
        <Empty title="Choose someone you feel comfortable reaching out to">
          You can save a trusted contact in Settings. This is optional.
        </Empty>
      )}
      <Button
        variant="secondary"
        onClick={() => {
          onClose()
          navigate('settings')
        }}
      >
        {contact.data ? 'Manage trusted contact' : 'Add a trusted contact'}
      </Button>
    </div>
  )
}

function PlacesTool() {
  const [area, setArea] = useState(''),
    [place, setPlace] = useState('parks')
  const query = `${place} ${area.trim() || 'near me'}`
  return (
    <div className="places-tool">
      <WellnessPhoto
        scene={
          place === 'cafés'
            ? 'cafe'
            : place === 'badminton courts' || place === 'gyms'
              ? 'play'
              : 'connect'
        }
      />
      <h3>Somewhere to take a fresh breath.</h3>
      <p>
        Choose what you’d like to find. Google Maps opens with your search;
        MoodMentor does not receive your location.
      </p>
      <label>
        What are you looking for?
        <select value={place} onChange={(e) => setPlace(e.target.value)}>
          {[
            'parks',
            'cafés',
            'gardens',
            'gyms',
            'badminton courts',
            'walking trails',
          ].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label>
        City or area (optional)
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          maxLength={100}
          placeholder="For example, Pune"
        />
      </label>
      <a
        className="btn btn-primary"
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
        target="_blank"
        rel="noreferrer"
      >
        Search in Google Maps <Icon name="arrow" />
      </a>
      <p className="quiet-note">
        This opens an external search. Live place listings inside MoodMentor are
        not connected yet.
      </p>
    </div>
  )
}

function MusicTool() {
  const [intention, setIntention] = useState('calm instrumental')
  return (
    <div className="music-tool">
      <WellnessPhoto scene="music" className="music-tool-photo" />
      <h3>A different soundtrack for your day.</h3>
      <p>Choose a direction, then explore music on your preferred service.</p>
      <div className="filter-chips">
        {[
          'calm instrumental',
          'focus piano',
          'uplifting music',
          'nature ambience',
        ].map((i) => (
          <button
            key={i}
            aria-pressed={intention === i}
            className={intention === i ? 'selected' : ''}
            onClick={() => setIntention(i)}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="button-row">
        <a
          className="btn btn-primary"
          href={`https://open.spotify.com/search/${encodeURIComponent(intention)}`}
          target="_blank"
          rel="noreferrer"
        >
          Open Spotify <Icon name="arrow" />
        </a>
        <a
          className="btn btn-secondary"
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(intention)}`}
          target="_blank"
          rel="noreferrer"
        >
          Open YouTube
        </a>
      </div>
      <p className="quiet-note">
        Opens an external music search. No music account is connected.
      </p>
    </div>
  )
}

export default function CompanionTools({
  selected = 'all',
  onSelect,
  onClose,
  onStart,
  onSafety,
  onUpdate,
}) {
  const title =
    selected === 'all'
      ? 'What would feel good right now?'
      : TOOLS.find((t) => t.id === selected)?.label || 'Reset moments'
  const start = (...args) => {
    onClose()
    onStart(...args)
  }
  return (
    <Dialog title={title} wide onClose={onClose}>
      <div className={`companion-tool-content tool-${selected}`}>
        <Suspense fallback={<Loading />}>
          {selected === 'all' ? (
            <>
              <p>
                Make a little space for yourself. Pick a tool, or keep talking.
              </p>
              <div className="tool-picker">
                {TOOLS.map((t) => (
                  <button key={t.id} onClick={() => onSelect(t.id)}>
                    <span className={`tool-icon tone-${t.tone}`}>
                      <Icon name={t.icon} />
                    </span>
                    <span>
                      <b>{t.label}</b>
                      <small>{t.description}</small>
                    </span>
                    <Icon name="arrow" size={16} />
                  </button>
                ))}
              </div>
              <div className="tool-editorial">
                <WellnessPhoto scene="cafe" />
                <div>
                  <p className="eyebrow">MAKE A LITTLE SPACE</p>
                  <h3>
                    A fresh place.
                    <br />
                    <em>A fresh perspective.</em>
                  </h3>
                  <button
                    className="editorial-text-link"
                    onClick={() => onSelect('places')}
                  >
                    Find a change of scenery <Icon name="arrow" size={15} />
                  </button>
                </div>
              </div>
              <div className="tool-coming">
                <Icon name="photo" />
                <div>
                  <b>Memory photos</b>
                  <p>
                    Google Photos selection is planned for a later release. Your
                    photo library is not connected.
                  </p>
                </div>
              </div>
            </>
          ) : selected === 'meditation' || selected === 'wellness' ? (
            <Library
              key={selected}
              meditation={selected === 'meditation'}
              embedded
              onStart={start}
              onSafety={onSafety}
            />
          ) : selected === 'studio' ? (
            <Studio />
          ) : selected === 'checkin' ? (
            <CommandCenter
              onStart={start}
              onSafety={onSafety}
              onUpdate={onUpdate}
            />
          ) : selected === 'music' ? (
            <MusicTool />
          ) : selected === 'places' ? (
            <PlacesTool />
          ) : selected === 'people' ? (
            <TrustedPerson onClose={onClose} />
          ) : selected === 'games' ? (
            <MoodGames onComplete={onClose} />
          ) : null}

        </Suspense>
      </div>
    </Dialog>
  )
}
