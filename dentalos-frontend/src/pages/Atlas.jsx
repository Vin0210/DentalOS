import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import DentalOSLogo from '../components/brand/DentalOSLogo.jsx'
import { Odontogram, ToothFigure } from '../components/odontogram/Odontogram.jsx'
import { morphologyFor, proportionFor, toothInfo } from '../components/odontogram/teeth.js'
import { Reveal } from '../components/motion/Motion.jsx'
import './Atlas.css'

const UPPER_RIGHT = ['18', '17', '16', '15', '14', '13', '12', '11']
const UPPER_LEFT = ['21', '22', '23', '24', '25', '26', '27', '28']
const LOWER_RIGHT = ['48', '47', '46', '45', '44', '43', '42', '41']
const LOWER_LEFT = ['31', '32', '33', '34', '35', '36', '37', '38']

const TYPE_ORDER = ['central', 'lateral', 'canine', 'premolar1', 'premolar2', 'molar1', 'molar2', 'wisdom']
const TYPE_TITLE = {
  central: 'Central incisors', lateral: 'Lateral incisors', canine: 'Canines',
  premolar1: 'First premolars', premolar2: 'Second premolars',
  molar1: 'First molars', molar2: 'Second molars', wisdom: 'Wisdom teeth',
}
const VIEWS = ['facial', 'lingual', 'mesial', 'distal', 'occlusal', 'root']

function ToothCard({ number }) {
  const info = toothInfo(number)
  const prop = proportionFor(info.type, info.arch)
  const morph = morphologyFor(info.type, info.arch)
  return (
    <Reveal className="atlas-card">
      <div className="atlas-figure" style={{ width: Math.round(120 * prop.w), height: Math.round(168 * prop.h) }}>
        <ToothFigure number={number} view="front" />
      </div>
      <div className="atlas-num">#{number}</div>
      <b className="atlas-name cap">{info.name}</b>
      <ul className="atlas-meta">
        <li className="cap">{info.type} · {info.arch} · {info.side}</li>
        {morph.map((m) => <li key={m}>{m}</li>)}
      </ul>
    </Reveal>
  )
}

const TYPE_SAMPLE = { central: '11', lateral: '12', canine: '13', premolar1: '14', premolar2: '15', molar1: '16', molar2: '17', wisdom: '18' }

function TypeStrip({ type }) {
  const upper = TYPE_SAMPLE[type] || '11'
  return (
    <Reveal className="atlas-type">
      <h3>{TYPE_TITLE[type]}</h3>
      <div className="atlas-views">
        {VIEWS.map((v) => (
          <figure key={v}>
            <ToothFigure number={upper} view={v} ghost={v === 'root'} />
            <figcaption className="cap">{v === 'facial' ? 'facial / front' : v}</figcaption>
          </figure>
        ))}
      </div>
    </Reveal>
  )
}

function ArchRow({ title, numbers }) {
  return (
    <div className="atlas-archrow">
      <h3>{title}</h3>
      <div className="atlas-teeth">
        {numbers.map((n) => {
          const info = toothInfo(n)
          const prop = proportionFor(info.type, info.arch)
          return (
            <div key={n} className="atlas-mini" style={{ width: Math.round(64 * prop.w) }}>
              <ToothFigure number={n} view="front" />
              <span>#{n}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Atlas() {
  return (
    <div className="atlas">
      <header className="atlas-head">
        <Link to="/" className="small muted row"><ArrowLeft size={14} /> DentalOS</Link>
        <span className="lp-brand"><DentalOSLogo size={22} /></span>
      </header>
      <div className="atlas-body">
        <Reveal>
          <p className="eyebrow">Anatomical reference</p>
          <h1>Permanent human dentition — 32 teeth.</h1>
          <p className="muted atlas-lead">Professional modeling reference for the DentalOS odontogram. Every tooth shows its real crown, cusp, and root morphology in FDI order — incisors narrow, canines long, premolars intermediate, molars broad. Left/right pairs are anatomical mirrors.</p>
        </Reveal>

        <Reveal><h2 className="atlas-h2">Maxillary arch — upper teeth</h2></Reveal>
        <ArchRow title="Upper right · 18 → 11" numbers={UPPER_RIGHT} />
        <ArchRow title="Upper left · 21 → 28" numbers={UPPER_LEFT} />

        <Reveal><h2 className="atlas-h2">Mandibular arch — lower teeth</h2></Reveal>
        <ArchRow title="Lower right · 48 → 41" numbers={LOWER_RIGHT} />
        <ArchRow title="Lower left · 31 → 38" numbers={LOWER_LEFT} />

        <Reveal><h2 className="atlas-h2">Tooth-by-tooth reference</h2></Reveal>
        <div className="atlas-grid">
          {[...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_RIGHT, ...LOWER_LEFT].map((n) => <ToothCard key={n} number={n} />)}
        </div>

        <Reveal><h2 className="atlas-h2">Views per tooth type</h2></Reveal>
        <p className="muted">Facial, lingual, mesial, distal, occlusal, and root views for accurate 3D modeling.</p>
        {TYPE_ORDER.map((t) => <TypeStrip key={t} type={t} />)}

        <Reveal>
          <h2 className="atlas-h2">Live interactive arch</h2>
          <p className="muted">The same anatomy, selectable — as used in the clinic chart.</p>
        </Reveal>
        <div className="atlas-live">
          <Odontogram records={{}} zoomable={false} chrome={false} />
        </div>
        <footer className="atlas-foot muted small">DentalOS anatomical reference · FDI World Dental Federation numbering · Upper/lower + left/right mirrored · Educational visualization, not for diagnosis.</footer>
      </div>
    </div>
  )
}
