import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import './Journey.css'

const STEPS = ['Examination', 'Diagnosis', 'Treatment plan', 'Procedure', 'Follow-up', 'Healthy smile']

export default function Journey() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section className="lp-section lp-journey" ref={ref}>
      <span className="lp-eyebrow">The journey</span>
      <h2>From first visit to healthy smile.</h2>
      <div className="journey">
        <i className="journey-line-bg" aria-hidden />
        <motion.i className="journey-line" style={reduce ? { scaleX: 1 } : { scaleX }} aria-hidden />
        {STEPS.map((s, i) => (
          <motion.div key={s} className="journey-step" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.07, duration: 0.4 }}>
            <b>{String(i + 1).padStart(2, '0')}</b>
            <span>{s}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
