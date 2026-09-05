import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { Boxes, CalendarDays, ClipboardList, Receipt, Stethoscope, Users, ArrowUp, ArrowDown, ArrowRight, Check } from 'lucide-react'
import api from '../services/api.js'
import { demoProcedures } from '../services/mock.js'
import { peso } from '../utils/format.js'
import HeroDental from '../components/hero/HeroDental.jsx'
import DentalOSLogo, { TOOTH_PATH } from '../components/brand/DentalOSLogo.jsx'
import OdontogramPreview from '../components/odontogram/OdontogramPreview.jsx'
import Journey from '../components/journey/Journey.jsx'
import DentalFact from '../components/fact/DentalFact.jsx'
import { AnimatedNumber, Reveal } from '../components/motion/Motion.jsx'
import './Landing.css'
import '../components/hero/HeroDental.css'
import '../components/fact/DentalFact.css'

// Thin gradient bar that fills as you scroll the page.
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 })
  return <motion.div className="lp-progress" style={{ scaleX }} aria-hidden />
}

const FEATURES = [
  { icon: Users, tone: 'teal', wide: true, viz: 'patients', title: 'Patient management', text: 'Rich profiles, medical histories, files and a chronological timeline for every patient.' },
  { icon: CalendarDays, tone: 'blue', title: 'Smart appointments', text: 'Day, week and month views with dentist and room conflict prevention built in.' },
  { icon: Stethoscope, tone: 'violet', viz: 'teeth', title: 'Interactive dental chart', text: 'FDI odontogram with per-tooth conditions and surface-level markings.' },
  { icon: ClipboardList, tone: 'amber', title: 'Treatment planning', text: 'Propose, price and track plans from diagnosis through completion.' },
  { icon: Receipt, tone: 'rose', title: 'Billing & payments', text: 'Invoices, partial payments, refunds and outstanding balances in pesos.' },
  { icon: Boxes, tone: 'green', viz: 'stock', title: 'Inventory & suppliers', text: 'Stock levels, low-stock and expiry alerts, purchase orders that update stock.' },
]

function FeatureViz({ viz }) {
  if (viz === 'patients') {
    return (
      <div className="lp-viz" aria-hidden>
        {['SM', 'JR', 'AL', 'KP'].map((t, i) => (
          <span key={t} className={`lp-avatar${i % 3 === 1 ? ' alt' : i % 3 === 2 ? ' alt2' : ''}`}>{t}</span>
        ))}
        <span className="lp-avatar more">+110</span>
      </div>
    )
  }
  if (viz === 'teeth') {
    return (
      <div className="lp-viz-teeth" aria-hidden>
        <b style={{ background: 'linear-gradient(135deg,#22c55e,#15803d)' }}>16</b>
        <b style={{ background: 'linear-gradient(135deg,#f59e0b,#b45309)' }}>26</b>
        <b style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}>36</b>
      </div>
    )
  }
  if (viz === 'stock') {
    return (
      <div className="lp-viz-stock" aria-hidden>
        <span>Nitrile gloves <i className="bar"><i style={{ width: '82%' }} /></i></span>
        <span>Anesthetic <i className="bar low"><i style={{ width: '24%' }} /></i></span>
      </div>
    )
  }
  return null
}

export default function Landing() {
  const [procedures, setProcedures] = useState(demoProcedures)
  const [egg, setEgg] = useState(0)
  useEffect(() => {
    api.get('/procedures').then(({ data }) => { if (Array.isArray(data) && data.length) setProcedures(data) }).catch(() => {})
  }, [])

  return (
    <div className="landing">
      <ScrollProgress />
      <header className="lp-nav">
        <span className="lp-brand"><DentalOSLogo size={24} /></span>
        <nav><a href="#features">Features</a><a href="#chart">Dental chart</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></nav>
        <div className="row"><Link className="btn ghost" to="/login">Sign in</Link><Link className="btn primary" to="/login">Get started</Link></div>
      </header>

      <section className="lp-hero">
        <div className="lp-hero-copy">
          <h1 className="lp-hero-title">Modern software<br />for modern<br />dental clinics.</h1>
          <p className="lp-hero-sub">DentalOS unifies patients, appointments, clinical records, billing and inventory in one calm, fast workspace your whole team will actually enjoy using.</p>
          <Link className="lp-hero-btn" to="/login">Get started</Link>
        </div>
        <div className="lp-hero-stage">
          <HeroDental />
        </div>
        <nav className="lp-hero-dots" aria-label="Section shortcuts">
          <a href="#" className="on" aria-label="Top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
          <a href="#features" aria-label="Features" />
          <a href="#chart" aria-label="Dental chart" />
          <a href="#pricing" aria-label="Pricing" />
          <a href="#faq" aria-label="FAQ" />
        </nav>
        <div className="lp-hero-arrows">
          <button type="button" onClick={() => window.scrollBy({ top: -window.innerHeight * 0.85, behavior: 'smooth' })} aria-label="Scroll up"><ArrowUp size={16} /></button>
          <button type="button" onClick={() => window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' })} aria-label="Scroll down"><ArrowDown size={16} /></button>
        </div>
      </section>

      <section className="lp-stats">
        {[['Demo patients', 110, '+'], ['Teeth per chart', 32, ''], ['User roles', 5, ''], ['Demo procedures', 40, '+']].map(([l, v, s], i) => (
          <Reveal key={l} delay={i * 0.08}>
            <div className="lp-stat"><b><AnimatedNumber value={v} />{s}</b><span>{l}</span></div>
          </Reveal>
        ))}
      </section>

      <section className="lp-logos" aria-label="Included modules"><span>Patients</span><span>Appointments</span><span>Dental chart</span><span>Billing</span><span>Inventory</span><span>Reports</span></section>

      <section className="lp-gallery" aria-label="Inside modern dental clinics">
        <div className="lp-marquee">
          {[['/images/treatment.jpg', 'Modern root canal treatment'], ['/images/checkup.jpg', 'Routine dental checkup'], ['/images/dentist.jpg', 'Dentist at work'], ['/images/mission.jpg', 'Community dental mission, Philippines']].concat([['/images/treatment.jpg', 'Modern root canal treatment'], ['/images/checkup.jpg', 'Routine dental checkup'], ['/images/dentist.jpg', 'Dentist at work'], ['/images/mission.jpg', 'Community dental mission, Philippines']]).map(([src, alt], i) => (
            <figure key={i} className="lp-shot"><img src={src} alt={alt} loading="lazy" /><figcaption>{alt}</figcaption></figure>
          ))}
        </div>
      </section>

      <section id="features" className="lp-section">
        <Reveal><span className="lp-eyebrow">The platform</span><h2>Everything a clinic needs, nothing it doesn&apos;t.</h2></Reveal>
        <Reveal delay={0.08}><p className="muted">Six tightly-integrated modules replace the spreadsheets, paper charts and disconnected tools.</p></Reveal>
        <div className="lp-features">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08} className={f.wide ? 'bento-wide' : undefined}>
              <div className={`lp-feature tone-${f.tone}`}>
                <span className="lp-feature-icon"><f.icon size={20} /></span>
                <h3>{f.title}</h3><p>{f.text}</p>
                <FeatureViz viz={f.viz} />
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}><div className="mt24" style={{ maxWidth: 640 }}><DentalFact /></div></Reveal>
      </section>

      <Journey />

      <section id="chart" className="lp-section lp-split">
        <div>
          <span className="lp-eyebrow">Clinical charting</span>
          <h2>See every tooth. Understand every treatment.</h2>
          <p className="muted">Keep a complete visual history of every patient&apos;s dental health. Hover or tap any tooth below — then try the full chart inside the app.</p>
          <ul className="lp-checks">{['Adult & pediatric numbering', 'Conditions: caries, filled, crown, root canal', 'Switch between arches', 'Works on tablet & mobile'].map((t) => <li key={t}><Check size={15} /> {t}</li>)}</ul>
          <Link className="btn primary" to="/login">Try the live chart</Link>
        </div>
        <OdontogramPreview />
      </section>

      <section className="lp-section">
        <span className="lp-eyebrow">Pricing</span>
        <h2>Transparent pricing in pesos.</h2>
        <div className="lp-prices">
          {[['Starter', '₱1,900', 'Single chair clinics', ['Up to 500 patients', 'Appointments & reminders', 'Billing & receipts']], ['Professional', '₱3,900', 'Growing practices', ['Unlimited patients', 'Odontogram & treatment plans', 'Inventory & reports', 'Patient portal'], true], ['Clinic Network', '₱7,900', 'Multi-branch groups', ['Everything in Professional', 'Multi-branch switching', 'Dentist performance', 'Audit logs & SSO']]].map(([name, price, sub, feats, hot]) => (
            <div key={name} className={`lp-price${hot ? ' hot' : ''}`}>
              {hot && <span className="badge primary">Most popular</span>}
              <h3>{name}</h3><div className="lp-amount">{price}<span>/mo</span></div><p className="muted small">{sub}</p>
              <ul>{feats.map((f) => <li key={f}><Check size={14} /> {f}</li>)}</ul>
              <Link className={`btn ${hot ? 'primary' : 'secondary'}`} to="/login">Choose {name}</Link>
            </div>
          ))}
        </div>
        <div className="lp-table card"><h3>Sample procedure pricing</h3>
          <div className="table-wrap"><table className="table"><thead><tr><th>Procedure</th><th>Code</th><th>Price</th></tr></thead>
            <tbody>{procedures.slice(0, 6).map((p) => <tr key={p.code}><td>{p.name}</td><td className="muted">{p.code}</td><td><b>{peso(p.default_price)}</b></td></tr>)}</tbody></table></div>
        </div>
      </section>

      <section className="lp-section">
        <span className="lp-eyebrow">Who it&apos;s for</span>
        <h2>Built for the whole team.</h2>
        <div className="lp-quotes">
          {[[Stethoscope, 'For dentists', 'Chart a full mouth in seconds, with complete per-tooth history and surface-level detail.'], [CalendarDays, 'For receptionists', "See today's queue, catch conflicts before they happen and book in a few clicks."], [Receipt, 'For accountants', 'Invoices, partial payments and outstanding balances — always reconciled in pesos.']].map(([Icon, t, d]) => (
            <div key={t} className="lp-quote lp-role">
              <span className="lp-role-icon"><Icon size={16} /></span>
              <b>{t}</b>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="lp-section">
        <h2>Frequently asked questions.</h2>
        <div className="lp-faq">
          {[['Can we import our existing patient list?', 'Yes — import from CSV or Excel during onboarding. Patient numbers, histories and balances carry over.'], ['Does it work for multiple branches?', 'Yes. Switch branches from the header; dentists, rooms, inventory and billing are scoped per branch.'], ['Is patient data secure?', 'All API access is Sanctum-authenticated with role checks on every endpoint, plus a full audit log.'], ['Can patients book online?', 'Yes. The patient portal supports appointment requests, invoices, prescriptions and notifications.']].map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>
      </section>

      <section className="lp-cta lp-cta-photo">
        <div className="lp-cta-inner"><h2>Run your clinic on DentalOS.</h2><p>Live demo data included — explore with one click.</p><Link className="btn primary lg" to="/login">View demo <ArrowRight size={16} /></Link></div>
      </section>
      <footer className="lp-footer">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <button type="button" className={`lp-egg${egg ? ' jump' : ''}`} onClick={() => setEgg((e) => e + 1)} aria-label="A hidden tooth">
              <svg viewBox="0 0 48 48" width="16" height="16" aria-hidden><path d={TOOTH_PATH} fill="currentColor" /></svg>
            </button>
            <AnimatePresence>
              {egg > 0 && (
                <motion.span key={egg} className="lp-egg-msg" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>Nice catch! 🦷</motion.span>
              )}
            </AnimatePresence>
          </span>
          <DentalOSLogo size={18} />
          <span className="muted">© 2026</span>
        </span>
        <span className="muted">Makati · Cebu · Davao · Photography via Unsplash</span>
      </footer>
    </div>
  )
}
