import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

const ThemeCtx = createContext(null)

// Circular theme reveal: the incoming theme iris-expands from the click point.
// Falls back to an instant swap (old browsers, reduced motion).
function revealTheme(next, setTheme, x, y) {
  if (typeof document === 'undefined') { setTheme(next); return }
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce || !document.startViewTransition) { setTheme(next); return }
  const px = x ?? window.innerWidth - 40
  const py = y ?? 40
  const transition = document.startViewTransition(() => {
    flushSync(() => setTheme(next))
  })
  transition.ready.then(() => {
    const r = Math.hypot(Math.max(px, window.innerWidth - px), Math.max(py, window.innerHeight - py))
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${px}px ${py}px)`, `circle(${r}px at ${px}px ${py}px)`] },
      { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }
    )
  }).catch(() => {})
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('dentalos_theme') || 'light')
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('dentalos_sidebar') === 'collapsed')
  const [toasts, setToasts] = useState([])
  const themeRef = useRef(theme)
  useEffect(() => { themeRef.current = theme }, [theme])

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

  const toggleTheme = useCallback((e) => {
    const next = themeRef.current === 'light' ? 'dark' : 'light'
    revealTheme(next, setTheme, e?.clientX, e?.clientY)
  }, [])

  const value = useMemo(() => ({
    theme, toggleTheme,
    collapsed, toggleSidebar: () => setCollapsed((c) => !c),
    toasts, toast,
  }), [theme, collapsed, toasts, toggleTheme])

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
