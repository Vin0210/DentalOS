import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { Activity, CalendarDays, Clock3, Lightbulb, ShieldCheck } from 'lucide-react'
import { EASE } from '../motion/Motion.jsx'

const FACTS = [
  'Your teeth are the hardest substance in your body — harder than bone.',
  'Tooth enamel cannot regrow, which is why prevention beats repair.',
  "Flossing reaches the 35% of tooth surface your brush can't.",
  'Your molars can bite with a force of up to 90 kilograms.',
  'No two people have the same tooth shape — not even identical twins.',
]

// 48-grid tooth (same design family as the DentalOS brand mark).
const TOOTH = 'M24 5C32 5 40 7.5 40 16C40 22.5 37.5 26 36.2 31C35 36.5 34.2 42 30 42C26.8 42 27.2 36.5 24 36.5C20.8 36.5 21.2 42 18 42C13.8 42 13 36.5 11.8 31C10.5 26 8 22.5 8 16C8 7.5 16 5 24 5Z'

// Anatomy hover zones → tooltip content + tooltip anchor position.
const PARTS = {
  enamel: { label: 'Enamel', text: 'The hardest substance in the human body', tip: { top: '10%', left: '2%' } },
  dentin: { label: 'Dentin', text: 'The sensitive layer beneath the enamel', tip: { top: '44%', right: '0%' } },
  pulp: { label: 'Pulp', text: 'Nerves and blood vessels live here', tip: { top: '56%', left: '0%' } },
  root: { label: 'Root', text: 'Anchored firmly into the jawbone', tip: { bottom: '2%', right: '2%' } },
}

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 29 + 7) % 100, top: (i * 41 + 11) % 100,
  size: 2 + ((i * 7) % 4), dur: 6 + (i % 5) * 1.6, delay: ((i * 13) % 40) / 10,
}))

const CARDS = [
  { key: 'health', icon: ShieldCheck, title: 'Dental Health', value: '98%', sub: 'Healthy', pos: { top: 0, left: 0 }, depth: 14, dur: 5.2, viz: 'ring', hideSm: false },
  { key: 'appts', icon: CalendarDays, title: "Today's Appointments", value: '12', sub: 'Scheduled', pos: { top: 40, right: 0 }, depth: -16, dur: 6.1, viz: 'dots', hideSm: true },
  { key: 'progress', icon: Activity, title: 'Treatment Progress', value: '78%', sub: 'Completed', pos: { bottom: 214, left: 0 }, depth: -14, dur: 5.7, viz: 'bars', hideSm: true },
  { key: 'next', icon: Clock3, title: 'Next Appointment', value: '10:30 AM', sub: 'Dr. Santos', pos: { bottom: 132, right: 0 }, depth: 16, dur: 6.5, viz: null, hideSm: true },
]

function CardViz({ kind }) {
  if (kind === 'ring') return (
    <svg viewBox="0 0 36 36" className="dosv-viz" aria-hidden>
      <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border)" strokeWidth="4" />
      <circle cx="18" cy="18" r="14" fill="none" stroke="var(--primary-light)" strokeWidth="4" strokeLinecap="round" strokeDasharray="88" strokeDashoffset="1.8" transform="rotate(-90 18 18)" />
    </svg>
  )
  if (kind === 'bars') return (
    <div className="dosv-viz-bars" aria-hidden>
      <i style={{ height: '40%' }} /><i style={{ height: '66%' }} /><i style={{ height: '52%' }} /><i className="hot" style={{ height: '84%' }} />
    </div>
  )
  if (kind === 'dots') return (
    <div className="dosv-viz-dots" aria-hidden><i /><i className="hot" /><i /><i /><i /></div>
  )
  return null
}

// Layered anatomy: enamel → dentin → pulp → root canals + gloss highlight.
function ToothArt() {
  return (
    <svg viewBox="0 0 200 195" className="dosv-tooth-svg" aria-hidden>
      <defs>
        <linearGradient id="dosv-enamel" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#c9f2ea" />
        </linearGradient>
        <linearGradient id="dosv-dentin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fe3d3" /><stop offset="1" stopColor="#4fd1bb" />
        </linearGradient>
        <radialGradient id="dosv-pulp" cx="0.5" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#0f766e" /><stop offset="1" stopColor="#134e4a" />
        </radialGradient>
      </defs>
      <g transform="translate(11 26) scale(3.7)">
        <path d={TOOTH} fill="url(#dosv-enamel)" stroke="#0f766e" strokeWidth="0.55" strokeLinejoin="round" />
        <path d={TOOTH} transform="translate(4.8 4.6) scale(0.8)" fill="url(#dosv-dentin)" opacity="0.92" />
        <ellipse cx="24" cy="19.5" rx="5.6" ry="7" fill="url(#dosv-pulp)" />
        <path d="M22.4 26C21.8 30 20.8 34 19.8 37.5" stroke="#134e4a" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M25.6 26C26.2 30 27.2 34 28.2 37.5" stroke="#134e4a" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M13.5 9.5C16 7.8 20 7 23.5 7.3" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.85" />
      </g>
    </svg>
  )
}

export default function DentalVisual() {
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const tiltX = useTransform(my, [-0.5, 0.5], [7, -7])
  const tiltY = useTransform(mx, [-0.5, 0.5], [-9, 9])
  const toothX = useTransform(mx, [-0.5, 0.5], [12, -12])
  const toothY = useTransform(my, [-0.5, 0.5], [9, -9])
  const fieldX = useTransform(mx, [-0.5, 0.5], [6, -6])
  const fieldY = useTransform(my, [-0.5, 0.5], [5, -5])
  const h1x = useTransform(mx, [-0.5, 0.5], [CARDS[0].depth, -CARDS[0].depth])
  const h2x = useTransform(mx, [-0.5, 0.5], [CARDS[1].depth, -CARDS[1].depth])
  const h3x = useTransform(mx, [-0.5, 0.5], [CARDS[2].depth, -CARDS[2].depth])
  const h4x = useTransform(mx, [-0.5, 0.5], [CARDS[3].depth, -CARDS[3].depth])
  const h1y = useTransform(my, [-0.5, 0.5], [CARDS[0].depth / 2.5, -CARDS[0].depth / 2.5])
  const h2y = useTransform(my, [-0.5, 0.5], [CARDS[1].depth / 2.5, -CARDS[1].depth / 2.5])
  const h3y = useTransform(my, [-0.5, 0.5], [CARDS[2].depth / 2.5, -CARDS[2].depth / 2.5])
  const h4y = useTransform(my, [-0.5, 0.5], [CARDS[3].depth / 2.5, -CARDS[3].depth / 2.5])
  const cardX = [h1x, h2x, h3x, h4x]
  const cardY = [h1y, h2y, h3y, h4y]
  const [part, setPart] = useState(null)
  const [fact, setFact] = useState(0)
  const [egg, setEgg] = useState(0)
  const [eggMsg, setEggMsg] = useState(false)

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

  const reset = useCallback(() => { mx.set(0); my.set(0); setPart(null) }, [mx, my])

  const crackEgg = () => {
    setEgg((n) => n + 1)
    setEggMsg(true)
    setTimeout(() => setEggMsg(false), 1700)
  }

  return (
    <motion.div className="dosv" onMouseMove={onMove} onMouseLeave={reset} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, delay: 0.1, ease: EASE }}>
      <motion.div className="dosv-field" style={reduce ? undefined : { x: fieldX, y: fieldY }} aria-hidden>
        {PARTICLES.map((p, i) => (
          <span key={i} className="dosv-dot" style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
        ))}
      </motion.div>

      <motion.div className="dosv-stage" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.18, ease: EASE }}>
        <div className="dosv-orbit" aria-hidden />
        <motion.div className="dosv-tooth" style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY, x: toothX, y: toothY, transformPerspective: 900 }}>
          <motion.div className="dosv-tooth-float" animate={reduce ? undefined : { y: [0, -12, 0], rotate: [0, 1.4, 0, -1.4, 0] }} transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}>
            <ToothArt />
            <div className="dosv-zones" aria-hidden onMouseLeave={() => setPart(null)}>
              {Object.entries(PARTS).map(([key]) => (
                <div key={key} className={`dosv-zone z-${key}`} onMouseEnter={() => setPart(key)} />
              ))}
              <AnimatePresence>
                {part && (
                  <motion.div key={part} className="dosv-tip" style={PARTS[part].tip} initial={{ opacity: 0, y: 6, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.94 }} transition={{ duration: 0.22, ease: EASE }}>
                    <b>{PARTS[part].label}</b>
                    <span>{PARTS[part].text}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {CARDS.map((c, i) => (
        <motion.div key={c.key} className={`dosv-card-wrap p-${c.key}${c.hideSm ? ' dosv-sm-hide' : ''}`} style={{ ...c.pos, ...(reduce ? {} : { x: cardX[i], y: cardY[i] }) }} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.34 + i * 0.09, ease: EASE }}>
          <motion.div className="dosv-card" animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ duration: c.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}>
            <span className="dosv-card-icon"><c.icon size={15} /></span>
            <span className="dosv-card-meta"><b>{c.value}</b><i>{c.title}</i><em>{c.sub}</em></span>
            <CardViz kind={c.viz} />
          </motion.div>
        </motion.div>
      ))}

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

      <div className="dosv-egg-zone">
        <motion.button key={egg} type="button" className="dosv-egg" onClick={crackEgg} aria-label="A little secret" whileTap={{ scale: 0.9 }} animate={egg ? { y: [0, -12, 0], rotate: [0, -8, 8, 0] } : undefined} transition={{ duration: 0.55 }}>
          <svg viewBox="0 0 48 48" width="22" height="22" aria-hidden><path d={TOOTH} fill="#ffffff" opacity="0.9" /></svg>
        </motion.button>
        <AnimatePresence>
          {egg > 0 && (
            <motion.span key={`spark-${egg}`} className="dosv-spark" initial={{ opacity: 1, scale: 0.3 }} animate={{ opacity: 0, scale: 1.9 }} transition={{ duration: 0.7 }} aria-hidden>✦</motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {eggMsg && (
            <motion.span key="nice" className="dosv-nice" initial={{ opacity: 0, y: 8, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
              Nice! You found the secret tooth ✨
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
