import { Icon } from './ui'

export const WELLNESS_IMAGES = {
  pause: '/images/sunlit-pause.png',
  connect: '/images/walk-together.png',
  calm: '/images/quiet-lake.png',
  music: '/images/music-moment.png',
  cafe: '/images/cafe-courtyard.png',
  play: '/images/park-badminton.png',
}

export function WellnessPhoto({
  scene = 'pause',
  alt = '',
  className = '',
  eager = false,
}) {
  return (
    <img
      className={`wellness-photo ${className}`}
      src={WELLNESS_IMAGES[scene]}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      width="1536"
      height="1024"
    />
  )
}

export function ActivityArtwork({ type = 'meditation', className = '' }) {
  const scene =
    type === 'music'
      ? 'music'
      : type === 'movement'
        ? 'play'
        : type === 'break'
          ? 'cafe'
          : ['walk', 'social'].includes(type)
            ? 'connect'
            : ['meditation', 'breathing'].includes(type)
              ? 'calm'
              : 'pause'
  if (!['game', 'focus', 'journaling'].includes(type))
    return (
      <WellnessPhoto
        scene={scene}
        className={`activity-artwork ${className}`}
      />
    )
  return (
    <div
      className={`activity-artwork artwork-${type} ${className}`}
      aria-hidden="true"
    >
      <span className="artwork-ring one" />
      <span className="artwork-ring two" />
      <span className="artwork-ring three" />
      <Icon
        name={
          type === 'music'
            ? 'music'
            : type === 'game'
              ? 'game'
              : type === 'focus'
                ? 'spark'
                : 'journal'
        }
        size={52}
      />
    </div>
  )
}
