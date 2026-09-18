import { lazy, Suspense, useState } from 'react'
import { Loading } from '../components/ui'
const Insights = lazy(() => import('./Insights'))
const History = lazy(() => import('./History'))

export default function Progress({ initial = 'patterns' }) {
  const [tab, setTab] = useState(initial)
  return (
    <>
      <div className="progress-switch" aria-label="Progress view">
        <button
          aria-pressed={tab === 'patterns'}
          onClick={() => setTab('patterns')}
        >
          Your patterns
        </button>
        <button
          aria-pressed={tab === 'history'}
          onClick={() => setTab('history')}
        >
          Moments & reflections
        </button>
      </div>
      <Suspense fallback={<Loading />}>
        {tab === 'patterns' ? <Insights /> : <History />}
      </Suspense>
    </>
  )
}
