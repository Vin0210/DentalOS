import { useEffect, useRef, useState } from 'react'
import api from '../../services/api.js'
import { initials, statusColor } from '../../utils/format.js'

export function Button({ variant = 'primary', size = 'md', loading, disabled, icon, children, className = '', ...rest }) {
  return (
    <button className={`btn ${variant} ${size}${loading ? ' loading' : ''}${className ? ` ${className}` : ''}`} disabled={disabled || loading} {...rest}>
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

export function Avatar({ name = '?', size = 36, color, src }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const [url, setUrl] = useState(undefined)
  // Remote avatar files need the auth token, which <img> can't send —
  // fetch as a blob (axios attaches it) instead of hot-linking.
  useEffect(() => {
    if (!src || src.startsWith('data:')) return
    let live = true
    api.get(src, { responseType: 'blob' })
      .then(({ data }) => { if (live) setUrl(URL.createObjectURL(data)) })
      .catch(() => {})
    return () => { live = false }
  }, [src])
  useEffect(() => () => { if (url?.startsWith('blob:')) URL.revokeObjectURL(url) }, [url])
  const shown = src?.startsWith('data:') ? src : url
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36, background: color, overflow: 'hidden' }}>
      {shown && failedSrc !== src
        ? <img src={shown} alt="" aria-hidden onError={() => setFailedSrc(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span aria-hidden>{initials(name)}</span>}
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

export function Input({ className = '', ...props }) { return <input className={`input${className ? ` ${className}` : ''}`} {...props} /> }
export function Select({ children, className = '', ...rest }) { return <select className={`input${className ? ` ${className}` : ''}`} {...rest}>{children}</select> }
export function Textarea({ className = '', ...props }) { return <textarea className={`input${className ? ` ${className}` : ''}`} rows={3} {...props} /> }

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

// Landing tone names (teal/blue/violet/amber/rose/green); legacy names still accepted.
const STAT_TONES = {
  primary: 'tone-teal', teal: 'tone-teal',
  success: 'tone-green', green: 'tone-green',
  warning: 'tone-amber', amber: 'tone-amber',
  danger: 'tone-rose', rose: 'tone-rose',
  info: 'tone-blue', blue: 'tone-blue',
  violet: 'tone-violet',
}

export function StatCard({ label, value, delta, icon, tone = 'teal' }) {
  const cls = STAT_TONES[tone] || 'tone-teal'
  return (
    <div className={`stat ${cls}`}>
      <div className="between">
        <span className="stat-label">{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      {delta && <div className="stat-delta">{delta}</div>}
    </div>
  )
}

// Bordered record row for lists inside cards (replaces hand-rolled .between + inline styles).
export function ListRow({ children, onClick, className = '' }) {
  const cls = `list-row${onClick ? ' clickable' : ''}${className ? ` ${className}` : ''}`
  if (onClick) return <button type="button" className={cls} onClick={onClick}>{children}</button>
  return <div className={cls}>{children}</div>
}
