import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

export function useResource(path) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [revision, setRevision] = useState(0)
  const reload = useCallback(() => setRevision((n) => n + 1), [])
  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    api(path)
      .then((value) => {
        if (alive) setData(value)
      })
      .catch((e) => {
        if (alive) setError(e.message)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [path, revision])
  return { data, setData, error, loading, reload }
}
export function navigate(page) {
  window.location.hash = page
}
export function useRoute() {
  const [route, setRoute] = useState(
    window.location.hash.slice(1) || 'companion',
  )
  useEffect(() => {
    const update = () => setRoute(window.location.hash.slice(1) || 'companion')
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return route
}
