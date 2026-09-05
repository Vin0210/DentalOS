import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { EASE } from '../motion/Motion.jsx'
import './OdontogramPreview.css'

const ADULT = {
  upper: ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'],
  lower: ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'],
}
const PRIMARY = {
  upper: ['55', '54', '53', '52', '51', '61', '62', '63', '64', '65'],
  lower: ['85', '84', '83', '82', '81', '71', '72', '73', '74', '75'],
}
const CONDITIONS = ['Healthy', 'Caries', 'Filled', 'Root canal', 'Crown']
const statusFor = (n) => CONDITIONS[Number(n) % CONDITIONS.length]
const clsFor = (s) => s.toLowerCase().replace(' ', '-')
const lastFor = (n) => ['Today', 'Yesterday', '2 days ago', 'Last week'][Number(n) % 4]
const LEGEND = [['Healthy', 'var(--border-strong)'], ['Caries', 'var(--danger)'], ['Filled', 'var(--info)'], ['Root canal', 'var(--violet)'], ['Crown', 'var(--warning)']]

export default function OdontogramPreview() {
  const [arch, setArch] = useState('upper')
  const [mode, setMode] = useState('adult')
  const [sel, setSel] = useState(null)
  const teeth = (mode === 'adult' ? ADULT : PRIMARY)[arch]

  return (
    <div className="odo">
      <div className="odo-controls">
        <div className="odo-toggle" role="group" aria-label="Arch">
          {[['upper', 'Upper arch'], ['lower', 'Lower arch']].map(([k, l]) => (
            <button key={k} type="button" className={arch === k ? 'on' : ''} onClick={() => { setArch(k); setSel(null) }}>{l}</button>
          ))}
        </div>
        <div className="odo-toggle" role="group" aria-label="Dentition">
          {[['adult', 'Adult'], ['primary', 'Pediatric']].map(([k, l]) => (
            <button key={k} type="button" className={mode === k ? 'on' : ''} onClick={() => { setMode(k); setSel(null) }}>{l}</button>
          ))}
        </div>
      </div>

      <div className="odo-grid">
        {teeth.map((n, i) => (
          <motion.button key={n + arch + mode} type="button"
            className={`odo-tooth c-${clsFor(statusFor(n))}${sel === n ? ' sel' : ''}`}
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.025, duration: 0.3, ease: EASE }}
            onClick={() => setSel(sel === n ? null : n)} aria-pressed={sel === n} aria-label={`Tooth ${n}, ${statusFor(n)}`}>
            {n}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {sel && (
          <motion.div className="odo-info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.25, ease: EASE }} role="status">
            <b>Tooth #{sel}</b>
            <span>Status: <em>{statusFor(sel)}</em></span>
            <span>Last checked: {lastFor(sel)}</span>
            <i>Preview of the DentalOS odontogram · demo data</i>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="odo-legend" aria-hidden>
        {LEGEND.map(([l, c]) => <span key={l}><i style={{ background: c }} /> {l}</span>)}
      </div>
    </div>
  )
}
