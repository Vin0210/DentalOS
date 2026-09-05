import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Lightbulb, RefreshCw } from 'lucide-react'
import { DENTAL_FACTS, dailyFact } from './facts.js'
import { EASE } from '../motion/Motion.jsx'
import './DentalFact.css'

// Small discovery moment: rotating dental fact with animated tooth + shuffle.
export default function DentalFact({ compact }) {
  const [idx, setIdx] = useState(() => DENTAL_FACTS.indexOf(dailyFact()))
  const [spin, setSpin] = useState(0)
  const shuffle = () => {
    setIdx((i) => (i + 1 + Math.floor(Math.random() * (DENTAL_FACTS.length - 1))) % DENTAL_FACTS.length)
    setSpin((s) => s + 360)
  }
  return (
    <div className={`fact${compact ? ' compact' : ''}`}>
      <motion.span className="fact-tooth" animate={{ rotate: spin }} transition={{ duration: 0.6, ease: EASE }} aria-hidden>
        <svg viewBox="0 0 40 56"><path d="M8 4 C8 2 12 1 20 1 C28 1 32 2 32 4 L30 24 C30 28 28 30 27 34 L25 50 C25 53 22 55 20 53 C18 55 15 53 15 50 L13 34 C12 30 10 28 10 24 Z" fill="#fff" stroke="#14b8a6" strokeWidth="2.4" /><circle cx="20" cy="14" r="3" fill="#14b8a6" opacity="0.7" /></svg>
      </motion.span>
      <div className="fact-body">
        <span className="fact-kicker"><Lightbulb size={13} /> Did you know?</span>
        <div className="fact-text">
          <AnimatePresence mode="wait">
            <motion.p key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: EASE }}>
              {DENTAL_FACTS[idx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <button className="icon-btn" onClick={shuffle} aria-label="Show another dental fact"><RefreshCw size={15} /></button>
    </div>
  )
}
