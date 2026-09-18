export const API_BASE = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '')
export const SESSION_KEY = 'moodmentor-session-v2'
export function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}
export function saveSession(result) {
  const session = { token: result.access_token, user: result.user }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}
export async function api(
  path,
  { method = 'GET', body, signal, token = readSession()?.token } = {},
) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  try {
    const response = await fetch(API_BASE + path, {
      method,
      signal: controller.signal,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (response.status === 204) return null
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      if (response.status === 401 && token && !path.startsWith('/auth/'))
        window.dispatchEvent(new Event('session-expired'))
      const detail = data?.detail
      const message = Array.isArray(detail)
        ? detail.map((e) => `${e.loc?.at(-1) || 'Field'}: ${e.msg}`).join('. ')
        : detail
      throw new Error(
        typeof message === 'string'
          ? message
          : 'We could not complete that request. Please try again.',
      )
    }
    return data
  } catch (error) {
    if (error.name === 'AbortError')
      throw new Error('The request took too long. Please try again.')
    if (error instanceof TypeError)
      throw new Error(
        'Cannot reach MoodMentor. Check that the API is running, then retry.',
      )
    throw error
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}

export async function beginGoogle() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const encode = (buffer) =>
    btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll('=', '')
  const verifier = encode(bytes)
  const challenge = encode(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)),
  )
  const result = await api('/auth/google/url', {
    method: 'POST',
    body: { code_challenge: challenge },
  })
  const url = new URL(result.url)
  sessionStorage.setItem(
    'google-pkce',
    JSON.stringify({ verifier, state: url.searchParams.get('state') }),
  )
  window.location.assign(url.href)
}
