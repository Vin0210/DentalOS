import { useCallback, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { EASE } from '../motion/Motion.jsx'
import './HeroDental.css'

// 48-grid geometric tooth — same design family as the DentalOS brand mark.
const TOOTH = 'M24 5C32 5 40 7.5 40 16C40 22.5 37.5 26 36.2 31C35 36.5 34.2 42 30 42C26.8 42 27.2 36.5 24 36.5C20.8 36.5 21.2 42 18 42C13.8 42 13 36.5 11.8 31C10.5 26 8 22.5 8 16C8 7.5 16 5 24 5Z'

const HOTSPOTS = [
  { key: 'enamel', label: 'Enamel', text: 'Protective outer layer of the tooth.', x: 46, y: 20, side: 'up' },
  { key: 'dentin', label: 'Dentin', text: 'The sensitive layer beneath the enamel.', x: 20, y: 38, side: 'up' },
  { key: 'pulp', label: 'Pulp', text: 'Nerves and blood vessels live here.', x: 68, y: 38, side: 'down' },
  { key: 'root', label: 'Root', text: 'Anchored firmly into the jawbone.', x: 44, y: 68, side: 'down' },
]

function ToothArt() {
  return (
    <svg viewBox="0 0 200 195" className="hero-tooth-svg" aria-hidden>
      <defs>
        <linearGradient id="hd-enamel" x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#ffffff" /><stop offset="0.55" stopColor="#f0eefc" /><stop offset="1" stopColor="#c9c4f4" />
        </linearGradient>
        <linearGradient id="hd-dentin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4bdf6" /><stop offset="1" stopColor="#8f87ee" />
        </linearGradient>
        <radialGradient id="hd-pulp" cx="0.5" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#7c6ff0" /><stop offset="1" stopColor="#5546c8" />
        </radialGradient>
      </defs>
      <g transform="translate(11 26) scale(3.7)">
        <path d={TOOTH} fill="url(#hd-enamel)" stroke="#6d5fe0" strokeWidth="0.45" strokeLinejoin="round" />
        <path d={TOOTH} transform="translate(4.8 4.6) scale(0.8)" fill="url(#hd-dentin)" opacity="0.9" />
        <ellipse cx="24" cy="19.5" rx="5.6" ry="7" fill="url(#hd-pulp)" />
        <path d="M22.4 26C21.8 30 20.8 34 19.8 37.5" stroke="#5546c8" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M25.6 26C26.2 30 27.2 34 28.2 37.5" stroke="#5546c8" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M13.5 9.5C16 7.8 20 7 23.5 7.3" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.95" />
      </g>
    </svg>
  )
}

export default function HeroDental() {
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const tiltX = useTransform(my, [-0.5, 0.5], [9, -9])
  const tiltY = useTransform(mx, [-0.5, 0.5], [-11, 11])
  const shiftX = useTransform(mx, [-0.5, 0.5], [-7, 7])
  const shiftY = useTransform(my, [-0.5, 0.5], [-5, 5])
  const [hot, setHot] = useState(null)

  const onMove = useCallback((e) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }, [mx, my, reduce])

  const reset = useCallback(() => { mx.set(0); my.set(0); setHot(null) }, [mx, my])

  return (
    <div className="hero-visual" onMouseMove={onMove} onMouseLeave={reset}>
      <div className="hero-blob b1" aria-hidden />
      <div className="hero-blob b2" aria-hidden />

      <motion.div className="hero-tilt" style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY, x: shiftX, y: shiftY, transformPerspective: 900 }} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15, ease: EASE }}>
        <motion.div className="hero-float" animate={reduce ? undefined : { y: [0, -12, 0], rotate: [0, 1.4, 0, -1.4, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
          <ToothArt />
          {HOTSPOTS.map((h) => (
            <button key={h.key} type="button" className={`hero-hotspot side-${h.side}`} style={{ left: `${h.x}%`, top: `${h.y}%` }} onMouseEnter={() => setHot(h.key)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(h.key)} onBlur={() => setHot(null)} aria-label={h.label}>
              <i className="hs-ring" aria-hidden />
              <span className="hs-line" aria-hidden />
              <span className="hs-label" aria-hidden>{h.label}</span>
            </button>
          ))}
          <AnimatePresence>
            {hot && (() => {
              const h = HOTSPOTS.find((x) => x.key === hot)
              return (
                <div key="anchor" className="hero-tip-anchor" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
                  <motion.div className="hero-tip" initial={{ opacity: 0, y: 6, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.95 }} transition={{ duration: 0.22, ease: EASE }}>
                    <b>{h.label}</b>
                    <span>{h.text}</span>
                  </motion.div>
                </div>
              )
            })()}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}
