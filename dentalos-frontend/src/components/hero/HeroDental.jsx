import { useCallback, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { EASE } from '../motion/Motion.jsx'
import './HeroDental.css'

// Real tooth render (public/images/realtooth.webp) with hero hotspot callouts.
const HOTSPOTS = [
  { key: 'enamel', label: 'Enamel', text: 'Hard, protective outer shell of the crown.', x: 66, y: 21, side: 'up' },
  { key: 'dentin', label: 'Dentin', text: 'Softer, ivory layer beneath the enamel.', x: 17, y: 44, side: 'up' },
  { key: 'pulp', label: 'Pulp', text: 'Nerves and blood vessels live here.', x: 50, y: 46, side: 'down' },
  { key: 'root', label: 'Root', text: 'Anchored firmly into the jawbone.', x: 36, y: 86, side: 'down' },
]

function ToothArt() {
  return (
    <img src="/images/realtooth.webp" className="hero-tooth-img" alt="" aria-hidden draggable={false} />
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

        <motion.div className="hero-tilt hero-enter" style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY, x: shiftX, y: shiftY, transformPerspective: 900 }} initial={false} transition={{ duration: 0.7, delay: 0.15, ease: EASE }}>
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
