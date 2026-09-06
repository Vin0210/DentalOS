import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { MousePointerClick } from 'lucide-react'
import { Odontogram, ToothFigure } from './Odontogram.jsx'
import { toothInfo } from './teeth.js'
import { EASE } from '../motion/Motion.jsx'

// Landing "explore mode": the same anatomical arch as the live chart,
// focused on anatomy + facts instead of clinical data. No backend needed.
export default function ChartExplore() {
  const [sel, setSel] = useState('13')
  const info = sel ? toothInfo(sel) : null
  return (
    <div className="lp-explore">
      <Odontogram records={{}} selected={sel} onSelect={(n) => setSel(n === sel ? null : n)} zoomable={false} chrome={false} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={sel || 'none'}
          className="lp-explore-panel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          {info ? (
            <>
              <div className="tooth-figure"><ToothFigure number={sel} view="front" /></div>
              <div>
                <p className="eyebrow">Tooth #{sel}</p>
                <h3 className="cap">{info.name}</h3>
                <p>{info.fact}</p>
                <Link className="lp-hero-btn" to="/login">Open the live chart</Link>
              </div>
            </>
          ) : (
            <>
              <span className="lp-explore-hint-icon"><MousePointerClick size={20} /></span>
              <div>
                <h3>Explore the arch</h3>
                <p>Hover any tooth to identify it — click to inspect its anatomy.</p>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
