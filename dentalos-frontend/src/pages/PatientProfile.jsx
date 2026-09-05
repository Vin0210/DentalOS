import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarPlus, FileText, Plus } from 'lucide-react'
import api from '../services/api.js'
import ImageViewer, { demoScans } from '../components/imaging/ImageViewer.jsx'
import '../components/imaging/ImageViewer.css'
import { demoTimeline } from '../services/mock.js'
import { fmtDate, peso } from '../utils/format.js'
import { Avatar, Button, Card, SkeletonList, StatusBadge } from '../components/ui/Ui.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function PatientProfile() {
  const { id } = useParams()
  const { toast } = useTheme()
  const [patient, setPatient] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [images, setImages] = useState(() => demoScans())

  const stages = ['Consultation', 'Diagnosis', 'Treatment', 'Follow-up', 'Completed']
  const hit = new Set(timeline.map((e) => e.type))
  const stageIdx = hit.has('billing') || hit.has('prescription') ? 3 : hit.has('treatment') ? 2 : hit.has('note') ? 1 : hit.has('appointment') ? 0 : -1
  const journeyPct = stageIdx < 0 ? 0 : Math.min(100, ((stageIdx + 1) / stages.length) * 100)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- profile data fetch on id change
    setLoading(true)
    Promise.all([
      api.get(`/patients/${id}`).then(({ data }) => data).catch(() => ({
        id, patient_no: 'PT-000123', first_name: 'Juan', last_name: 'Dela Cruz', age: 29, gender: 'male',
        phone: '+639171234567', email: 'juan@example.com', address: '12 Mabini St, Quezon City',
        emergency_name: 'Maria Dela Cruz', emergency_phone: '+639187654321', blood_type: 'O+',
        status: 'active', medicalHistory: { allergies: ['Penicillin'], conditions: [], medications: [] },
        dentalHistory: { history: 'Regular checkups', oral_hygiene_notes: 'Brush twice daily' },
        odontogram: [], treatmentPlans: [], invoices: [], appointments: [],
      })),
      api.get(`/patients/${id}/timeline`).then(({ data }) => data).catch(() => demoTimeline),
    ]).then(([p, t]) => { setPatient(p); setTimeline(t) }).finally(() => setLoading(false))
  }, [id])

  const addNote = async (e) => {
    e.preventDefault()
    if (!note.trim()) return
    setSavingNote(true)
    try {
      await api.post(`/patients/${id}/notes`, { chief_complaint: note })
      toast('Clinical note saved to timeline.', 'success')
      setNote('')
      const { data } = await api.get(`/patients/${id}/timeline`).catch(() => ({ data: demoTimeline }))
      setTimeline(data)
    } catch { toast('Could not save note (demo mode).', 'warning') }
    finally { setSavingNote(false) }
  }

  if (loading) return <div className="page"><SkeletonList rows={8} /></div>
  if (!patient) return <div className="page"><p>Patient not found.</p></div>
  const name = patient.full_name || `${patient.first_name} ${patient.last_name}`

  return (
    <div className="page">
      <Link to="/app/patients" className="small muted row" style={{ marginBottom: 12 }}><ArrowLeft size={14} /> All patients</Link>
      <div className="profile-head">
        <div className="profile-id">
          <Avatar name={name} size={60} />
          <div>
            <h1>{name}</h1>
            <p className="small muted">Patient ID: {patient.patient_no}</p>
            <div className="profile-facts">
              <div><span>Age</span><b>{patient.age ?? '—'}</b></div>
              <div><span>Gender</span><b style={{ textTransform: 'capitalize' }}>{patient.gender}</b></div>
              <div><span>Status</span><b><StatusBadge value={patient.status} /></b></div>
              <div><span>Blood</span><b>{patient.blood_type || '—'}</b></div>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          <Link className="btn primary sm" to={`/app/appointments?patient=${patient.id}`}><CalendarPlus size={14} /> Book appointment</Link>
          <Link className="btn secondary sm" to={`/app/treatments?patient=${patient.id}`}><Plus size={14} /> New treatment</Link>
          <Link className="btn secondary sm" to={`/app/chart?patient=${patient.id}`}><FileText size={14} /> Dental chart</Link>
        </div>
      </div>

      <div className="tabs mt16" role="tablist">
        {['overview', 'treatments', 'appointments', 'billing', 'files'].map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid two">
          <div className="grid" style={{ gap: 16 }}>
            <Card title="Personal information">
              <div className="info-grid">
                <div><span>Phone</span><b>{patient.phone || '—'}</b></div>
                <div><span>Email</span><b>{patient.email || '—'}</b></div>
                <div><span>Address</span><b>{patient.address || '—'}</b></div>
                <div><span>Emergency</span><b>{patient.emergency_name || '—'}</b></div>
                <div><span>Emergency phone</span><b>{patient.emergency_phone || '—'}</b></div>
                <div><span>DOB</span><b>{fmtDate(patient.date_of_birth)}</b></div>
              </div>
            </Card>
            <Card title="Medical information">
              <div className="info-grid">
                <div><span>Allergies</span><b>{patient.medicalHistory?.allergies?.join(', ') || 'None recorded'}</b></div>
                <div><span>Conditions</span><b>{patient.medicalHistory?.conditions?.join(', ') || 'None'}</b></div>
                <div><span>Medications</span><b>{patient.medicalHistory?.medications?.join(', ') || 'None'}</b></div>
              </div>
            </Card>
            <Card title="Add clinical note">
              <form onSubmit={addNote} className="row" style={{ alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}><input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Chief complaint, observation…" aria-label="Clinical note" /></div>
                <Button loading={savingNote} type="submit">Save</Button>
              </form>
            </Card>
          </div>
          <Card title="Timeline" subtitle="Chronological patient history">
            <div className="journey" role="img" aria-label={`Dental journey ${Math.round(journeyPct)} percent complete`}>
              <div className="journey-track"><motion.i initial={{ width: 0 }} animate={{ width: `${journeyPct}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} /></div>
              <div className="journey-steps">
                {stages.map((s, i) => <span key={s} className={i <= stageIdx ? 'done' : ''}>{s}</span>)}
              </div>
            </div>
            <motion.div className="timeline" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>
              {timeline.map((ev, i) => (
                <motion.div key={i} className={`timeline-item ${ev.type}`} variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0 } }}>
                  <div className="timeline-date">{fmtDate(ev.date)}</div>
                  <div className="timeline-title">{ev.title}</div>
                  <div className="timeline-sub">{ev.subtitle}</div>
                </motion.div>
              ))}
              {!timeline.length && <p className="muted small">No history yet.</p>}
            </motion.div>
          </Card>
        </div>
      )}

      {tab === 'treatments' && (
        <Card title="Treatment plans" subtitle={`${patient.treatmentPlans?.length ?? 0} plans`}>
          {(patient.treatmentPlans || []).map((t) => (
            <div key={t.id} className="between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div><b>{t.title}</b><p className="small muted">{t.items?.length || 0} items</p></div>
              <StatusBadge value={t.status} />
            </div>
          ))}
          {!patient.treatmentPlans?.length && <p className="muted small">No treatment plans yet. <Link to={`/app/treatments?patient=${patient.id}`}>Create one</Link>.</p>}
        </Card>
      )}

      {tab === 'appointments' && (
        <Card title="Appointments">
          {(patient.appointments || []).map((a) => (
            <div key={a.id} className="between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div><b>{fmtDate(a.date)} · {a.start_time?.slice(0, 5)}</b><p className="small muted">{a.dentist?.user?.name}</p></div>
              <StatusBadge value={a.status} />
            </div>
          ))}
          {!patient.appointments?.length && <p className="muted small">No appointments yet.</p>}
        </Card>
      )}

      {tab === 'billing' && (
        <Card title="Billing">
          {(patient.invoices || []).map((inv) => (
            <div key={inv.id} className="between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div><b>{inv.invoice_no}</b><p className="small muted">{peso(inv.total)} · paid {peso(inv.paid)}</p></div>
              <StatusBadge value={inv.status} />
            </div>
          ))}
          {!patient.invoices?.length && <p className="muted small">No invoices yet.</p>}
        </Card>
      )}

      {tab === 'files' && (
        <Card title="Files & dental images" subtitle="X-rays, photographs and scans">
          <ImageViewer
            images={images}
            onUpload={(img) => setImages((a) => [img, ...a])}
            onDelete={(id) => setImages((a) => a.filter((x) => x.id !== id))}
          />
        </Card>
      )}
    </div>
  )
}
