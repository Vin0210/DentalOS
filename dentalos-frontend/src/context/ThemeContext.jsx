import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeCtx = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('dentalos_theme') || 'light')
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('dentalos_sidebar') === 'collapsed')
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('dentalos_theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('dentalos_sidebar', collapsed ? 'collapsed' : 'open')
  }, [collapsed])

  const toast = (message, kind = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }

  const value = useMemo(() => ({
    theme, toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    collapsed, toggleSidebar: () => setCollapsed((c) => !c),
    toasts, toast,
  }), [theme, collapsed, toasts])

  return (
    <ThemeCtx.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className={`toast ${t.kind}`}>{t.message}</div>)}
      </div>
    </ThemeCtx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- colocated context hook (idiomatic)
export const useTheme = () => useContext(ThemeCtx)
