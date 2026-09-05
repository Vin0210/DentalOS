import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { setToken } from '../services/api.js'
import { DEMO_USER } from '../services/mock.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dentalos_user') || 'null') } catch { return null }
  })
  const [demoMode, setDemoMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const boot = async () => {
      const token = localStorage.getItem('dentalos_token')
      if (!token) { setLoading(false); return }
      try {
        const { data } = await api.get('/auth/me')
        setUser(data.user)
        localStorage.setItem('dentalos_user', JSON.stringify(data.user))
      } catch {
        // keep cached user for offline demo continuity
        if (!localStorage.getItem('dentalos_user')) setToken(null)
      }
      setLoading(false)
    }
    boot()
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password, device: 'web' })
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('dentalos_user', JSON.stringify(data.user))
      setDemoMode(false)
      return data.user
    } catch (err) {
      // Graceful demo fallback: known demo accounts work without backend
      const demoAccounts = {
        'admin@dentalos.ph': { ...DEMO_USER, role: 'clinic_admin' },
        'dentist@dentalos.ph': { ...DEMO_USER, name: 'Dr. Sofia Mendoza', role: 'dentist' },
        'reception@dentalos.ph': { ...DEMO_USER, name: 'Ana Reyes', role: 'receptionist' },
        'accounting@dentalos.ph': { ...DEMO_USER, name: 'Mark Villanueva', role: 'accountant' },
        'patient@dentalos.ph': { ...DEMO_USER, name: 'Jenny Cruz', role: 'patient' },
      }
      if (demoAccounts[email] && password === 'password') {
        setUser(demoAccounts[email])
        localStorage.setItem('dentalos_user', JSON.stringify(demoAccounts[email]))
        setDemoMode(true)
        return demoAccounts[email]
      }
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout') } catch { /* offline */ }
    setToken(null)
    setUser(null)
    localStorage.removeItem('dentalos_user')
    setDemoMode(false)
  }, [])

  const value = useMemo(() => ({ user, demoMode, loading, login, logout, setUser }), [user, demoMode, loading, login, logout])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- colocated context hook (idiomatic)
export const useAuth = () => useContext(AuthCtx)
