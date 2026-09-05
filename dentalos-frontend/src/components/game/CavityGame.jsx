import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Gamepad2, Play, RotateCcw, Trophy, X } from 'lucide-react'
import { EASE } from '../motion/Motion.jsx'
import './CavityGame.css'

const DURATION = 30

// "Catch the Cavity" — tap plaque microbes before the timer ends. Combo rewards streaks.
export function GameFab() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <motion.button
        className="game-fab" onClick={() => setOpen(true)} aria-label="Play Catch the Cavity"
        whileHover={{ scale: 1.08, rotate: -4 }} whileTap={{ scale: 0.92 }}
        title="Catch the Cavity"
      >
        <Gamepad2 size={20} />
      </motion.button>
      <AnimatePresence>{open && <CavityGame onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  )
}

function CavityGame({ onClose }) {
  const [phase, setPhase] = useState('idle') // idle | playing | over
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('dentalos_cavity_best') || 0))
  const [time, setTime] = useState(DURATION)
  const [bugs, setBugs] = useState([])
  const idRef = useRef(0)
  const timerRef = useRef(null)
  const spawnRef = useRef(null)

  const spawn = useCallback(() => {
    setBugs((b) => {
      if (b.length >= 5) return b
      const id = ++idRef.current
      return [...b, { id, x: 8 + Math.random() * 80, y: 18 + Math.random() * 62, size: 26 + Math.random() * 18, born: Date.now() }]
    })
  }, [])

  const start = () => {
    setScore(0); setCombo(0); setTime(DURATION); setBugs([]); setPhase('playing')
    timerRef.current = setInterval(() => setTime((t) => {
      if (t <= 1) { clearInterval(timerRef.current); clearInterval(spawnRef.current); setPhase('over'); return 0 }
      return t - 1
    }), 1000)
    spawnRef.current = setInterval(spawn, 650)
    spawn()
  }

  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(spawnRef.current) }, [])

  useEffect(() => {
    if (phase === 'over' && score > best) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- persist record on game over
      setBest(score)
      localStorage.setItem('dentalos_cavity_best', String(score))
    }
  }, [phase, score, best])

  const whack = (bug, e) => {
    e.stopPropagation()
    const age = Date.now() - bug.born
    const gained = Math.round((10 + combo * 2) * (age < 900 ? 1.5 : 1))
    setScore((s) => s + gained)
    setCombo((c) => Math.min(12, c + 1))
    setBugs((b) => b.map((x) => (x.id === bug.id ? { ...x, dying: true } : x)))
    setTimeout(() => setBugs((b) => b.filter((x) => x.id !== bug.id)), 160)
  }

  const miss = () => { if (phase === 'playing') setCombo(0) }

  return (
    <motion.div className="game-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div
        className="game" role="dialog" aria-modal="true" aria-label="Catch the Cavity game"
        initial={{ scale: 0.9, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        <div className="between">
          <h3>Catch the Cavity</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close game"><X size={16} /></button>
        </div>

        <div className="game-hud">
          <span className="hud"><b>{score.toLocaleString()}</b> score</span>
          <span className={`hud combo${combo >= 4 ? ' hot' : ''}`}>x{Math.max(1, combo)} combo</span>
          <span className="hud"><b>{time}s</b> left</span>
          <span className="hud"><Trophy size={13} /> {best.toLocaleString()}</span>
        </div>
        <div className="game-timebar"><motion.i animate={{ width: `${(time / DURATION) * 100}%` }} transition={{ duration: 0.4 }} /></div>

        <div className="game-arena" onMouseDown={miss}>
          <div className="game-tooth" aria-hidden>
            <svg viewBox="0 0 40 56"><path d="M8 4 C8 2 12 1 20 1 C28 1 32 2 32 4 L30 24 C30 28 28 30 27 34 L25 50 C25 53 22 55 20 53 C18 55 15 53 15 50 L13 34 C12 30 10 28 10 24 Z" fill="#fff" stroke="#0f766e" strokeWidth="2" /></svg>
          </div>
          <AnimatePresence>
            {bugs.map((bug) => (
              <motion.button
                key={bug.id} className={`bug${bug.dying ? ' dying' : ''}`}
                style={{ left: `${bug.x}%`, top: `${bug.y}%`, width: bug.size, height: bug.size }}
                initial={{ scale: 0 }} animate={{ scale: bug.dying ? 1.6 : 1, opacity: bug.dying ? 0 : 1 }} exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                onMouseDown={(e) => whack(bug, e)} aria-label="Cavity microbe — tap to clean"
              >
                <i /><i /><i />
              </motion.button>
            ))}
          </AnimatePresence>

          {phase === 'idle' && (
            <div className="game-overlay">
              <p className="small">Plaque microbes attack the tooth.<br />Tap them before time runs out!</p>
              <button className="btn primary" onClick={start}><Play size={15} /> Start game</button>
            </div>
          )}
          {phase === 'over' && (
            <div className="game-overlay">
              <h4>Time! Score: {score.toLocaleString()}</h4>
              <p className="small muted">{score >= best && score > 0 ? 'New clinic record!' : `Best: ${best.toLocaleString()}`}</p>
              <button className="btn primary" onClick={start}><RotateCcw size={15} /> Play again</button>
            </div>
          )}
        </div>
        <p className="small muted" style={{ marginTop: 8 }}>Tip: fast taps build a combo multiplier. Best score is saved on this device.</p>
      </motion.div>
    </motion.div>
  )
}
