import { useState } from 'react'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import { TEETH_LOWER, TEETH_UPPER, TOOTH_COLORS } from '../../utils/format.js'
import { EASE } from '../motion/Motion.jsx'
import './Odontogram.css'

// Clinical SVG tooth with condition overlays. Motion handles hover lift,
// tap squash, staggered entrance and the selected glow pulse.
export function Tooth({ number, condition = 'healthy', selected, dimmed, onSelect, onHover, index = 0, animateIn = true, small }) {
  const fill = TOOTH_COLORS[condition] || '#fff'
  const dark = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark'
  const label = `Tooth ${number}, ${condition.replace(/_/g, ' ')}`
  return (
    <motion.button
      type="button"
      className={`tooth${selected ? ' selected' : ''}${dimmed ? ' dimmed' : ''}${small ? ' small' : ''}`}
      onClick={() => onSelect?.(number)}
      onMouseEnter={() => onHover?.(number)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(number)}
      onBlur={() => onHover?.(null)}
      aria-label={label}
      aria-pressed={!!selected}
      title={label}
      initial={animateIn ? { opacity: 0, y: 12, scale: 0.85 } : false}
      animate={{ opacity: dimmed ? 0.35 : 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: animateIn ? Math.min(index * 0.028, 0.9) : 0, ease: EASE }}
      whileHover={{ y: -7, scale: 1.14 }}
      whileTap={{ scale: 0.92 }}
    >
      <svg viewBox="0 0 40 56" aria-hidden>
        <path
          d="M8 4 C8 2 12 1 20 1 C28 1 32 2 32 4 L30 24 C30 28 28 30 27 34 L25 50 C25 53 22 55 20 53 C18 55 15 53 15 50 L13 34 C12 30 10 28 10 24 Z"
          fill={condition === 'healthy' ? (dark ? '#1a2745' : fill) : fill}
          stroke={selected ? 'var(--primary)' : condition === 'missing' || condition === 'extracted' ? 'var(--text-muted)' : '#94a3b8'}
          strokeWidth={selected ? 2.6 : 1.6}
          strokeDasharray={condition === 'missing' ? '4 3' : undefined}
          opacity={condition === 'missing' || condition === 'extracted' ? 0.55 : 1}
        />
        {condition === 'caries' && <circle cx="20" cy="14" r="4.5" fill="#7f1d1d" />}
        {condition === 'filled' && <rect x="14" y="9" width="12" height="8" rx="2" fill="#1e40af" opacity="0.85" />}
        {condition === 'crown' && <rect x="10" y="4" width="20" height="12" rx="3" fill="none" stroke="#b45309" strokeWidth="2" />}
        {condition === 'implant' && <path d="M17 30 L23 30 L20 52 Z" fill="#15803d" />}
        {(condition === 'missing' || condition === 'extracted') && <path d="M11 8 L29 26 M29 8 L11 26" stroke="var(--danger)" strokeWidth="2.4" strokeLinecap="round" />}
        {condition === 'fractured' && <path d="M12 6 L18 16 L14 22 L22 30" stroke="var(--danger)" strokeWidth="1.8" fill="none" />}
        {condition === 'root_canal' && <path d="M20 4 L20 50" stroke="#6d28d9" strokeWidth="2.4" />}
      </svg>
      <span>{number}</span>
    </motion.button>
  )
}

export function Odontogram({ records = {}, selected, onSelect, zoomable = true }) {
  const [hovered, setHovered] = useState(null)
  const [zoom, setZoom] = useState(1)
  const rec = (n) => records[n]?.condition || 'healthy'
  const tip = hovered ? { n: hovered, c: rec(hovered) } : selected ? { n: selected, c: rec(selected), pinned: true } : null

  const row = (teeth, offset) => (
    <div className="teeth-row">
      {teeth.map((n, i) => (
        <Tooth key={n} number={n} index={offset + i} condition={rec(n)} selected={selected === n} dimmed={!!selected && selected !== n} onSelect={onSelect} onHover={setHovered} />
      ))}
    </div>
  )

  return (
    <div className="odonto" role="group" aria-label="Adult odontogram">
      {zoomable && (
        <div className="od-tools">
          <span className="small muted">FDI numbering · hover to inspect, click to focus</span>
          <span className="row">
            <button className="icon-btn" onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(1)))} aria-label="Zoom out" disabled={zoom <= 1}><ZoomOut size={15} /></button>
            <span className="small muted" style={{ minWidth: 40, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
            <button className="icon-btn" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.2).toFixed(1)))} aria-label="Zoom in" disabled={zoom >= 1.6}><ZoomIn size={15} /></button>
            <button className="icon-btn" onClick={() => { setZoom(1); onSelect?.(null) }} aria-label="Reset view"><Maximize size={15} /></button>
          </span>
        </div>
      )}
      <div className="od-zoom" style={{ transform: `scale(${zoom})` }}>
        <div className="arch">
          <span className="arch-label">Upper</span>
          {row(TEETH_UPPER, 0)}
        </div>
        <div className="midline"><i />Midline<i /></div>
        <div className="arch">
          <span className="arch-label">Lower</span>
          {row(TEETH_LOWER, 16)}
        </div>
      </div>
      <div className="od-tip" aria-live="polite">
        {tip ? <span><b>Tooth #{tip.n}</b> · {tip.c.replace(/_/g, ' ')}{tip.pinned && !hovered ? ' · focused' : ''}</span> : <span className="muted">Hover a tooth to inspect it</span>}
      </div>
      <Legend />
    </div>
  )
}

export function Legend() {
  return (
    <div className="od-legend">
      {Object.entries({ healthy: 'Healthy', caries: 'Caries', filled: 'Filled', crown: 'Crown', root_canal: 'Root canal', implant: 'Implant', missing: 'Missing', fractured: 'Fractured' }).map(([k, l]) => (
        <span key={k}><i style={{ background: TOOTH_COLORS[k], border: '1px solid #94a3b8' }} />{l}</span>
      ))}
    </div>
  )
}
