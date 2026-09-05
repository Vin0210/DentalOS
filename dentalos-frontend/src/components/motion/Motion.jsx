/* eslint-disable react-refresh/only-export-components -- motion primitives, helpers and constants live together by design */
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

export const EASE = [0.22, 1, 0.36, 1]
export const springSoft = { type: 'spring', stiffness: 260, damping: 26 }

// Fade + rise on scroll into view. Delay staggers siblings.
export function Reveal({ children, delay = 0, y = 18, className, once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

// Animated page enter (150–300ms, transform + opacity only)
export function PageWrap({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: EASE }}>
      {children}
    </motion.div>
  )
}

// Count-up number when scrolled into view
export function AnimatedNumber({ value, format = (v) => Math.round(v).toLocaleString(), duration = 1.1 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- count-up on first view
    if (reduce) { setDisplay(value); return }
    let raf = 0
    const start = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - p, 3)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- rAF count-up tick
      setDisplay(value * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration, reduce])

  return <span ref={ref}>{format(display)}</span>
}

// Animated SVG progress ring (stroke-dashoffset only — GPU friendly)
export function ProgressRing({ value, max = 100, size = 88, stroke = 9, tone = 'var(--primary)', label, sub }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })
  const reduce = useReducedMotion()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value / max))
  return (
    <div ref={ref} className="pring" style={{ width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${value} of ${max}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={inView ? { strokeDashoffset: c * (1 - pct) } : {}}
          transition={{ duration: reduce ? 0 : 1.2, ease: EASE }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="pring-center"><b>{value}{max !== 100 ? '' : '%'}</b>{max !== 100 && <span>/{max}</span>}</div>
      {(label || sub) && <div className="pring-meta">{label && <b>{label}</b>}{sub && <span>{sub}</span>}</div>}
    </div>
  )
}

// Stagger container + item helpers
export const staggerParent = { hidden: {}, show: { transition: { staggerChildren: 0.045 } } }
export const staggerChild = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}
