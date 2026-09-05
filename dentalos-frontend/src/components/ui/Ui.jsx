import { useEffect, useRef } from 'react'
import { initials, statusColor } from '../../utils/format.js'

export function Button({ variant = 'primary', size = 'md', loading, disabled, icon, children, ...rest }) {
  return (
    <button className={`btn ${variant} ${size}${loading ? ' loading' : ''}`} disabled={disabled || loading} {...rest}>
      {loading ? <span className="spinner" aria-hidden /> : icon}
      <span>{children}</span>
    </button>
  )
}

export function Card({ title, subtitle, action, children, className = '', pad = true }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <div className="card-head">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-sub">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={pad ? 'card-body' : 'card-body flush'}>{children}</div>
    </section>
  )
}

export function Badge({ tone = 'info', children }) {
  return <span className={`badge ${tone}`}>{children}</span>
}

export function StatusBadge({ value }) {
  const label = String(value ?? '—').replace(/_/g, ' ')
  return <span className={`badge ${statusColor(value)}`}>{label}</span>
}

export function Avatar({ name = '?', size = 36, color }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36, background: color }} aria-hidden>
      {initials(name)}
    </span>
  )
}

export function Field({ label, error, hint, children, htmlFor }) {
  return (
    <label className="field" htmlFor={htmlFor}>
      <span className="field-label">{label}</span>
      {children}
      {error ? <span className="field-error" role="alert">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  )
}

export function Input(props) { return <input className="input" {...props} /> }
export function Select({ children, ...rest }) { return <select className="input" {...rest}>{children}</select> }
export function Textarea(props) { return <textarea className="input" rows={3} {...props} /> }

export function Modal({ open, title, onClose, children, wide }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    ref.current?.querySelector('input,select,textarea,button')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div ref={ref} className={`modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="between">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>
        <div className="mt12">{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, hint, action }) {
  return (
    <div className="empty">
      <span className="icon">{icon}</span>
      <h4 style={{ color: 'var(--text-primary)', margin: '0 0 4px' }}>{title}</h4>
      {hint && <p className="small">{hint}</p>}
      {action && <div className="mt12">{action}</div>}
    </div>
  )
}

export function SkeletonList({ rows = 5 }) {
  return <div className="grid" style={{ gap: 10 }}>{Array.from({ length: rows }, (_, i) => <div key={i} className="skeleton" style={{ height: 46 }} />)}</div>
}

export function StatCard({ label, value, delta, icon, tone = 'primary' }) {
  return (
    <div className="stat">
      <div className="between">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon ${tone}`}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      {delta && <div className="stat-delta">{delta}</div>}
    </div>
  )
}
