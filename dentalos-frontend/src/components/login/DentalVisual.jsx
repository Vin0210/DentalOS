import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { Clock3, Lightbulb, ShieldCheck } from 'lucide-react'
import { EASE } from '../motion/Motion.jsx'

const FACTS = [
  'Your teeth are the hardest substance in your body — harder than bone.',
  'Tooth enamel cannot regrow, which is why prevention beats repair.',
  "Flossing reaches the 35% of tooth surface your brush can't.",
  'Your molars can bite with a force of up to 90 kilograms.',
  'No two people have the same tooth shape — not even identical twins.',
]

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 29 + 7) % 100, top: (i * 41 + 11) % 100,
  size: 2 + ((i * 7) % 4), dur: 6 + (i % 5) * 1.6, delay: ((i * 13) % 40) / 10,
}))

const CHIPS = [
  { key: 'health', icon: ShieldCheck, value: '98%', title: 'Dental Health', sub: 'Healthy', viz: 'ring' },
  { key: 'next', icon: Clock3, value: '10:30 AM', title: 'Next Appointment', sub: 'Dr. Santos', viz: null },
]

function CardViz({ kind }) {
  if (kind === 'ring') return (
    <svg viewBox="0 0 36 36" className="dosv-viz" aria-hidden>
      <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border)" strokeWidth="4" />
      <circle cx="18" cy="18" r="14" fill="none" stroke="var(--primary-light)" strokeWidth="4" strokeLinecap="round" strokeDasharray="88" strokeDashoffset="1.8" transform="rotate(-90 18 18)" />
    </svg>
  )
  return null
}

// Photo story: real clinic photography with floating stat chips, gentle parallax.
export default function DentalVisual() {
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const gridX = useTransform(mx, [-0.5, 0.5], [10, -10])
  const gridY = useTransform(my, [-0.5, 0.5], [8, -8])
  const fieldX = useTransform(mx, [-0.5, 0.5], [6, -6])
  const fieldY = useTransform(my, [-0.5, 0.5], [5, -5])
  const [fact, setFact] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setFact((f) => (f + 1) % FACTS.length), 7000)
    return () => clearInterval(t)
  }, [])

  const onMove = useCallback((e) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }, [mx, my, reduce])

  const reset = useCallback(() => { mx.set(0); my.set(0) }, [mx, my])

  return (
    <motion.div className="dosv" onMouseMove={onMove} onMouseLeave={reset} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, delay: 0.1, ease: EASE }}>
      <motion.div className="dosv-field" style={reduce ? undefined : { x: fieldX, y: fieldY }} aria-hidden>
        {PARTICLES.map((p, i) => (
          <span key={i} className="dosv-dot" style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
        ))}
      </motion.div>

      <motion.div
        className="photo-grid"
        style={reduce ? undefined : { x: gridX, y: gridY }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
      >
        <div className="photo-main">
          <img src="/images/dentist.jpg" alt="Dentist at work in a modern clinic" loading="eager" />
          {CHIPS.map((c, i) => (
            <motion.div
              key={c.key}
              className={`photo-chip chip-${c.key}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.12, ease: EASE }}
            >
              <span className="dosv-card" style={{ animation: 'none' }}>
                <span className="dosv-card-icon"><c.icon size={15} /></span>
                <span className="dosv-card-meta"><b>{c.value}</b><i>{c.title}</i><em>{c.sub}</em></span>
                <CardViz kind={c.viz} />
              </span>
            </motion.div>
          ))}
        </div>
        <div className="photo-col">
          <div className="photo-small"><img src="/images/treatment.jpg" alt="Modern root canal treatment" loading="lazy" /></div>
          <div className="photo-small"><img src="/images/checkup.jpg" alt="Routine dental checkup" loading="lazy" /></div>
        </div>
      </motion.div>

      <motion.div className="dosv-fact" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55, ease: EASE }}>
        <span className="dosv-fact-icon"><Lightbulb size={14} /></span>
        <div>
          <b>Dental fact</b>
          <AnimatePresence mode="wait">
            <motion.p key={fact} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
              {FACTS[fact]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
