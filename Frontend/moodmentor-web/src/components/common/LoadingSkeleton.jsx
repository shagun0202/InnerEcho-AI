export function DashboardSkeleton() {
  return (
    <div className="skeleton dashboard-skeleton">
      <div className="skeleton-line" style={{ width: '30%', height: '32px', marginBottom: '8px' }} />
      <div className="skeleton-line" style={{ width: '60%', height: '16px', marginBottom: '24px' }} />
      <div className="stats" style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-card" style={{ flex: 1, height: '100px' }} />
        ))}
      </div>
      <div className="grid-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="skeleton-card" style={{ height: '300px' }} />
        <div className="skeleton-card" style={{ height: '300px' }} />
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="skeleton-card" style={{ height: '150px', marginBottom: '16px', padding: '24px' }}>
      <div className="skeleton-line" style={{ width: '40%', height: '24px', marginBottom: '16px' }} />
      <div className="skeleton-line" style={{ width: '100%', height: '16px', marginBottom: '8px' }} />
      <div className="skeleton-line" style={{ width: '80%', height: '16px' }} />
    </div>
  )
}

export function ChatSkeleton() {
  return (
    <div className="skeleton chat-skeleton">
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', flexDirection: i % 2 === 0 ? 'row-reverse' : 'row', marginBottom: '16px' }}>
          <div className="skeleton-card" style={{ width: '60%', height: '60px', borderRadius: '12px' }} />
        </div>
      ))}
    </div>
  )
}
