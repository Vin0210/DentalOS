import { useId, useState } from 'react'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import { TEETH_LOWER, TEETH_UPPER, TOOTH_COLORS } from '../../utils/format.js'
import { artFor, canalsFor, chamberFor, LINGUAL, OCCLUSAL, SIDE, orientationFor, toothInfo } from './teeth.js'
import { EASE } from '../motion/Motion.jsx'
import './Odontogram.css'

const isDark = () => typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark'

// Shared enamel / root gradients in natural ivory (spec: base #F8F5EE,
// highlight #FFFEFA, shadow #D9D4C8 — never plastic pure-white).
function ArtDefs({ id, dark }) {
  return (
    <defs>
      <linearGradient id={`${id}-enamel`} x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0" stopColor={dark ? '#3a4c74' : '#fffefa'} />
        <stop offset="0.55" stopColor={dark ? '#2a3856' : '#f8f5ee'} />
        <stop offset="1" stopColor={dark ? '#1d2740' : '#d9d4c8'} />
      </linearGradient>
      <linearGradient id={`${id}-root`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={dark ? '#42557c' : '#f5f1e6'} />
        <stop offset="1" stopColor={dark ? '#26334f' : '#d9d4c8'} />
      </linearGradient>
    </defs>
  )
}

// Clinical condition overlays for the front view, drawn from the art landmarks.
function ConditionOverlay({ art, condition }) {
  switch (condition) {
    case 'caries': {
      const [cx, cy] = art.caries
      return <circle cx={cx} cy={cy} r="4.5" fill="#7f1d1d" />
    }
    case 'filled': {
      const [x, y, w, h] = art.filling
      return <rect x={x} y={y} width={w} height={h} rx="2" fill="#1e40af" opacity="0.85" />
    }
    case 'crown':
      return <path d={art.crown} fill="none" stroke="#b45309" strokeWidth="2.4" strokeLinejoin="round" />
    case 'fractured':
      return <path d={art.fracture} stroke="#b91c1c" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    case 'root_canal':
      return null // canals drawn by the caller in violet
    default:
      return null
  }
}

// Front / occlusal / side / root anatomical figure. Distinct drawing per view,
// never a rotated icon. Used by the arch (front) and the detail panel (all views).
export function ToothFigure({ number, condition = 'healthy', surfaces = [], view = 'front', ghost = false }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const dark = isDark()
  const info = toothInfo(number)
  const art = artFor(info.type, info.arch)
  const missing = condition === 'missing' || condition === 'extracted'
  const flat = !missing && condition !== 'healthy' && condition !== 'root_canal' ? (TOOTH_COLORS[condition] || null) : null
  const stroke = missing ? 'var(--text-muted)' : dark ? '#5a6b8f' : '#8f846e'
  const groove = dark ? '#5a6b8f' : '#9c8a5f'
  const mirror = info.side === 'left' ? 'translate(40 0) scale(-1 1)' : undefined

  const surfaceZone = (s) => {
    const band = { fill: 'var(--primary-light)', opacity: 0.5 }
    if (s === 'mesial') return <rect key={s} x="5" y="4" width="9" height="48" rx="3" {...band} />
    if (s === 'distal') return <rect key={s} x="26" y="4" width="9" height="48" rx="3" {...band} />
    if (s === 'buccal' || s === 'facial') return <rect key={s} x="14" y="4" width="12" height="48" rx="3" {...band} />
    if (s === 'occlusal' || s === 'incisal') return <rect key={s} x="7" y="2" width="26" height="10" rx="4" {...band} />
    if (s === 'lingual') return <rect key={s} x="11" y="8" width="18" height="40" rx="6" {...band} fill="var(--violet)" />
    return null
  }

  if (view === 'occlusal') {
    const o = OCCLUSAL[info.type] || OCCLUSAL.premolar2
    return (
      <svg viewBox="0 0 40 56" role="img" aria-label={`${info.name} occlusal view`}>
        <ArtDefs id={uid} dark={dark} />
        <path d={o.shape} fill={flat || `url(#${uid}-enamel)`} stroke={stroke} strokeWidth="1.6" />
        {o.grooves.map((d, i) => <path key={i} d={d} stroke={groove} strokeWidth="1.4" fill="none" strokeLinecap="round" />)}
        {o.pits.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="1.8" fill={groove} />)}
        {surfaces.includes('mesial') && <rect x="6" y="14" width="12" height="26" rx="5" fill="var(--primary-light)" opacity="0.5" />}
        {surfaces.includes('distal') && <rect x="22" y="14" width="12" height="26" rx="5" fill="var(--primary-light)" opacity="0.5" />}
        {(surfaces.includes('occlusal') || surfaces.includes('incisal') || surfaces.includes('buccal') || surfaces.includes('facial') || surfaces.includes('lingual')) && (
          <path d={o.shape} fill="var(--primary-light)" opacity="0.35" />
        )}
        {condition === 'caries' && <circle cx="20" cy="27" r="4" fill="#7f1d1d" />}
        {condition === 'filled' && <rect x="15" y="22" width="10" height="8" rx="2" fill="#1e40af" opacity="0.85" />}
      </svg>
    )
  }

  if (view === 'side' || view === 'mesial' || view === 'distal') {
    const s = SIDE[info.type] || SIDE.premolar2
    // Distal is the mirrored mesial profile (real distal anatomy tilts the same way).
    const flip = info.side === 'left' ? 'translate(40 0) scale(-1 1)' : undefined
    const distalFlip = view === 'distal' ? 'translate(40 0) scale(-1 1)' : undefined
    return (
      <svg viewBox="0 0 40 56" role="img" aria-label={`${info.name} ${view} view`}>
        <ArtDefs id={uid} dark={dark} />
        <g transform={distalFlip}>
          <g transform={flip}>
            {s.roots.map((d, i) => <path key={i} d={d} fill={flat || `url(#${uid}-root)`} stroke={stroke} strokeWidth="1.6" />)}
            <path d={s.crown} fill={flat || `url(#${uid}-enamel)`} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
            {condition === 'caries' && <circle cx="20" cy="14" r="4" fill="#7f1d1d" />}
            {condition === 'filled' && <rect x="15" y="10" width="10" height="7" rx="2" fill="#1e40af" opacity="0.85" />}
            {condition === 'crown' && <path d={s.crown} fill="none" stroke="#b45309" strokeWidth="2.4" strokeLinejoin="round" />}
            {condition === 'root_canal' && <path d="M20 8 L20 50" stroke="#6d28d9" strokeWidth="2.4" />}
          </g>
        </g>
      </svg>
    )
  }

  if (view === 'lingual') {
    const l = LINGUAL[info.type] || LINGUAL.premolar2
    return (
      <svg viewBox="0 0 40 56" role="img" aria-label={`${info.name} lingual view`}>
        <ArtDefs id={uid} dark={dark} />
        <g transform={mirror}>
          <path d={l.crown} fill={flat || `url(#${uid}-enamel)`} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
          {l.cingulum && <ellipse cx={l.cingulum[0]} cy={l.cingulum[1]} rx={l.cingulum[2]} ry={l.cingulum[3]} fill={groove} opacity="0.45" />}
          {l.details.map((d, i) => <path key={i} d={d} stroke={groove} strokeWidth="1.3" fill="none" strokeLinecap="round" />)}
          {l.dots.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="1.8" fill={groove} />)}
          {condition === 'caries' && <circle cx="20" cy="16" r="4" fill="#7f1d1d" />}
          {condition === 'filled' && <rect x="15" y="11" width="10" height="7" rx="2" fill="#1e40af" opacity="0.85" />}
          {condition === 'crown' && <path d={l.crown} fill="none" stroke="#b45309" strokeWidth="2.4" strokeLinejoin="round" />}
        </g>
      </svg>
    )
  }

  // Front + root views share the anatomical art; root view ghosts the enamel.
  const chamber = chamberFor(info.type)
  const canals = canalsFor(info.type, info.arch)
  const ghostProps = ghost ? { opacity: 0.35 } : {}
  return (
    <svg viewBox="0 0 40 56" role="img" aria-label={`${info.name} ${view} view`}>
      <ArtDefs id={uid} dark={dark} />
      <g transform={mirror}>
        {condition === 'implant' ? (
          <>
            <path d={art.crown} fill={flat || `url(#${uid}-enamel)`} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" {...ghostProps} />
            <path d="M17 28 L23 28 L21.5 50 L20 54 L18.5 50 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="1.4" />
            {[33, 38, 43, 48].map((y) => <line key={y} x1="17.5" y1={y} x2="22.5" y2={y} stroke="#64748b" strokeWidth="1.2" />)}
          </>
        ) : (
          <>
            {art.roots.map((d, i) => (
              <path key={i} d={d} fill={missing ? 'none' : flat || `url(#${uid}-root)`} stroke={stroke} strokeWidth="2"
                strokeDasharray={missing ? '4 3' : undefined} opacity={missing ? 0.55 : 1} />
            ))}
            <path d={art.crown} fill={missing ? 'none' : flat || `url(#${uid}-enamel)`} stroke={stroke} strokeWidth="2"
              strokeDasharray={missing ? '4 3' : undefined} opacity={missing ? 0.55 : 1} strokeLinejoin="round" {...ghostProps} />
          </>
        )}
        {!missing && art.grooves.map((d, i) => <path key={i} d={d} stroke={groove} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.9" />)}
        {!missing && <ConditionOverlay art={art} condition={condition} />}
        {(ghost || condition === 'root_canal') && !missing && (
          <>
            <ellipse cx={chamber.cx} cy={chamber.cy} rx={chamber.rx} ry={chamber.ry} fill={condition === 'root_canal' ? '#6d28d9' : '#e11d48'} opacity="0.85" />
            {canals.map(([d], i) => <path key={i} d={d} stroke={condition === 'root_canal' ? '#4c1d95' : '#be123c'} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9" />)}
          </>
        )}
        {missing && <path d="M11 8 L29 26 M29 8 L11 26" stroke="var(--danger)" strokeWidth="2.4" strokeLinecap="round" />}
        {!missing && surfaces.map(surfaceZone)}
      </g>
    </svg>
  )
}

// Interactive arch tooth: distinct anatomy per type, arch curvature tilt,
// hover tooltip with number + type, subtle 1.04 hover scale.
export function Tooth({ number, condition = 'healthy', selected, dimmed, onSelect, onHover, index = 0, pos, animateIn = true, small }) {
  const [tip, setTip] = useState(false)
  const info = toothInfo(number)
  const { tilt, lift } = orientationFor(pos ?? 7.5, info.arch)
  const label = `Tooth ${number}, ${info.name}`
  return (
    <motion.button
      type="button"
      className={`tooth${selected ? ' selected' : ''}${dimmed ? ' dimmed' : ''}${small ? ' small' : ''}`}
      onClick={() => onSelect?.(number)}
      onMouseEnter={() => { setTip(true); onHover?.(number) }}
      onMouseLeave={() => { setTip(false); onHover?.(null) }}
      onFocus={() => { setTip(true); onHover?.(number) }}
      onBlur={() => { setTip(false); onHover?.(null) }}
      aria-label={label}
      aria-pressed={!!selected}
      title={label}
      initial={animateIn ? { opacity: 0, y: 12, scale: 0.85 } : false}
      animate={{ opacity: dimmed ? 0.35 : 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: animateIn ? Math.min(index * 0.028, 0.9) : 0, ease: EASE }}
      whileHover={{ y: -4, scale: 1.04 }}
      whileTap={{ scale: 0.92 }}
    >
      <span className="tooth-tilt" style={{ transform: `rotate(${tilt}deg) translateY(${lift}px)` }}>
        <ToothFigure number={number} condition={condition} view="front" />
        <span>{number}</span>
      </span>
      {tip && <span className="tooth-tip" aria-hidden>#{number} · {info.name}</span>}
    </motion.button>
  )
}

export function Odontogram({ records = {}, selected, onSelect, zoomable = true, chrome = true }) {
  const [hovered, setHovered] = useState(null)
  const [zoom, setZoom] = useState(1)
  const rec = (n) => records[n]?.condition || 'healthy'
  const tip = hovered ? { n: hovered, c: rec(hovered) } : selected ? { n: selected, c: rec(selected), pinned: true } : null

  const row = (teeth, offset) => (
    <div className="teeth-row">
      {teeth.map((n, i) => (
        <Tooth key={n} number={n} index={offset + i} pos={i} condition={rec(n)} selected={selected === n} dimmed={!!selected && selected !== n} onSelect={onSelect} onHover={setHovered} />
      ))}
    </div>
  )

  return (
    <div className="odonto" role="group" aria-label="Adult odontogram">
      {chrome && zoomable && (
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
      {chrome && (
        <div className="od-tip" aria-live="polite">
          {tip ? <span><b>Tooth #{tip.n}</b> · {toothInfo(tip.n).name} · {tip.c.replace(/_/g, ' ')}{tip.pinned && !hovered ? ' · focused' : ''}</span> : <span className="muted">Hover a tooth to inspect it</span>}
        </div>
      )}
      {chrome && <Legend />}
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
