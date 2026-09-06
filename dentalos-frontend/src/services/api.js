import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  timeout: 15000,
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
// Relative path lets axios resolve it against the configured baseURL.
export const avatarUrl = (userId) => `/avatar/${userId}`
export const resolveAvatar = (user) => {
  if (!user?.avatar) return undefined
  return String(user.avatar).startsWith('data:') ? user.avatar : avatarUrl(user.id)
}

export default api
