const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export async function request(path, options = {}) {
  const { method = 'GET', token, body } = options
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // Auto-logout on expired token
  if (res.status === 401) {
    localStorage.removeItem('moodmentor-session')
    window.location.reload()
    throw new Error('Session expired. Please sign in again.')
  }

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.detail || `Request failed (${res.status})`)
  return data
}
