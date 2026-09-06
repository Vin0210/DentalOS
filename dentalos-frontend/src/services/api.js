import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

const api = axios.create({
  baseURL: API_BASE,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  timeout: 90000, // free-tier cold starts (Render sleeps) can take ~60s to wake
})

export function setToken(token) {
  if (token) {
    localStorage.setItem('dentalos_token', token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    localStorage.removeItem('dentalos_token')
    delete api.defaults.headers.common.Authorization
  }
}

const existing = localStorage.getItem('dentalos_token')
if (existing) api.defaults.headers.common.Authorization = `Bearer ${existing}`

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status
    if (status === 401 && !window.location.pathname.includes('/login')) {
      // don't hard-redirect during demo; let AuthContext handle it
    }
    return Promise.reject(err)
  },
)

export function friendlyError(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data
  if (!err?.response) return 'Cannot reach the server. Check that the backend is running.'
  if (data?.message) return data.message
  if (data?.errors) {
    const first = Object.values(data.errors)[0]
    if (Array.isArray(first)) return first[0]
  }
  return fallback
}

// Profile photos are served through the API (same origin in prod, Vite-proxied in dev).
// Uses API_BASE so split-domain deploys (Vercel + Render) still resolve correctly.
export const avatarUrl = (userId) => `${API_BASE}/avatar/${userId}`
export const resolveAvatar = (user) => {
  if (!user?.avatar) return undefined
  return String(user.avatar).startsWith('data:') ? user.avatar : avatarUrl(user.id)
}

export default api
