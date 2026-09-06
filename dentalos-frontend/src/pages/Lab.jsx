import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList, FileText, Pill, Save, Stethoscope } from 'lucide-react'
import api from '../services/api.js'
import { demoAppointments } from '../services/mock.js'
import { fmtTime, peso } from '../utils/format.js'
import { Avatar, Button, Card, Field, Input, ListRow, StatusBadge } from '../components/ui/Ui.jsx'
import { Odontogram } from '../components/odontogram/Odontogram.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

const STEPS = ['Patient', 'History', 'Chart', 'Diagnosis', 'Plan', 'Procedure', 'Rx', 'Notes']

// Dedicated dentist workspace: one screen, full visit flow, minimal navigation.
export default function Lab() {
  const { toast } = useTheme()
  const [step, setStep] = useState(0)
  const [patientId, setPatientId] = useState('1')
  const [today, setToday] = useState([])
  const [records, setRecords] = useState({})
  const [selected, setSelected] = useState('16')
  const [saving, setSaving] = useState(false)
  const [rx, setRx] = useState([{ medication: 'Amoxicillin', dosage: '500mg', frequency: '3x daily', duration: '7 days' }])

  useEffect(() => {
    const d = new Date().toISOString().slice(0, 10)
    api.get('/appointments', { params: { date: d, per_page: 20 } }).then(({ data }) => setToday(data.data)).catch(() => setToday(demoAppointments))
    api.get(`/patients/${patientId}/odontogram`).then(({ data }) => {
      const map = {}; Object.values(data).forEach((r) => { map[r.tooth_number] = r }); setRecords(map)
    }).catch(() => {})
  }, [patientId])

  const saveTooth = async (condition) => {
    setSaving(true)
    try {
      const { data } = await api.post(`/patients/${patientId}/odontogram`, { tooth_number: selected, condition })
      setRecords((r) => ({ ...r, [selected]: data }))
      toast(`Tooth #${selected} → ${condition}.`, 'success')
    } catch { setRecords((r) => ({ ...r, [selected]: { tooth_number: selected, condition } })); toast('Saved locally (demo).', 'warning') }
    finally { setSaving(false) }
  }

  const saveNote = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    try {
      await api.post(`/patients/${patientId}/notes`, { chief_complaint: fd.get('chief_complaint'), examination: fd.get('examination'), diagnosis: fd.get('diagnosis'), treatment_performed: fd.get('treatment_performed'), dentist_notes: fd.get('notes') })
      toast('Visit note saved to timeline.', 'success')
    } catch { toast('Note saved locally (demo).', 'warning') }
  }

  const saveRx = async () => {
    try {
      await api.post(`/patients/${patientId}/prescriptions`, { items: rx.map((r) => ({ ...r, instructions: `Take ${r.frequency}` })) })
      toast('Prescription created — printable from patient history.', 'success')
    } catch { toast('Prescription saved locally (demo).', 'warning') }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div><p className="eyebrow">Dentist workspace</p><h1 className="page-title">Dentist workspace</h1><p className="page-sub">Today&apos;s patients → full visit flow on one screen</p></div>
        <label className="small muted mini-field">Patient <Input value={patientId} onChange={(e) => setPatientId(e.target.value)} /></label>
      </div>

      <div className="flow-steps">{STEPS.map((s, i) => <button key={s} className={i === step ? 'active' : i < step ? 'done' : ''} onClick={() => setStep(i)}>{i + 1}. {s}</button>)}</div>

      <div className="grid two mt16 items-start">
        <div className="grid gap-16">
          <Card title="Today's patients" subtitle={`${today.length} on the books`} action={<Link className="btn ghost sm" to="/app/appointments">Calendar <ArrowRight size={14} /></Link>}>
            <div className="appt-list">
              {today.slice(0, 6).map((a) => (
                <button key={a.id} className="appt" onClick={() => { setPatientId(String(a.patient?.id || patientId)); setStep(1) }}>
                  <span className="appt-time">{fmtTime(a.start_time)}</span>
                  <Avatar name={`${a.patient?.first_name} ${a.patient?.last_name}`} size={32} />
                  <span className="appt-main"><b>{a.patient?.first_name} {a.patient?.last_name}</b><i>{a.procedure?.name || 'Visit'}</i></span>
                  <StatusBadge value={a.status} />
                </button>
              ))}
            </div>
          </Card>

          <Card title={`Chart — tooth #${selected}`} subtitle="Tap a tooth, set condition in one click">
            <Odontogram records={records} selected={selected} onSelect={setSelected} />
            <div className="row wrap mt12 cap">
              {['healthy', 'caries', 'filled', 'crown', 'root_canal', 'implant'].map((c) => (
                <Button key={c} variant="secondary" size="sm" disabled={saving} onClick={() => saveTooth(c)}>{c.replace(/_/g, ' ')}</Button>
              ))}
            </div>
          </Card>

          <Card title="Visit note (SOAP)" subtitle="Saved to the patient timeline">
            <form onSubmit={saveNote}>
              <div className="form-grid">
                <Field label="Chief complaint"><Input name="chief_complaint" placeholder="Toothache, upper right…" /></Field>
                <Field label="Examination"><Input name="examination" placeholder="Percussion positive #16…" /></Field>
                <Field label="Diagnosis"><Input name="diagnosis" placeholder="Irreversible pulpitis" /></Field>
                <Field label="Treatment performed"><Input name="treatment_performed" placeholder="Root canal, Visit 1" /></Field>
                <Field label="Dentist notes" ><Input name="notes" placeholder="Follow up in 7 days…" /></Field>
              </div>
              <div className="between mt12"><span /><Button icon={<Save size={15} />} type="submit">Save note</Button></div>
            </form>
          </Card>
        </div>

        <div className="grid gap-16">
          <Card title="Quick actions" subtitle="No page-hopping during a visit">
            <div className="grid gap-8">
              <Link className="btn secondary" to={`/app/treatments?patient=${patientId}`}><ClipboardList size={15} /> Treatment plan</Link>
              <Link className="btn secondary" to={`/app/chart?patient=${patientId}`}><Stethoscope size={15} /> Full dental chart</Link>
              <Link className="btn secondary" to={`/app/patients/${patientId}`}><FileText size={15} /> Patient profile</Link>
            </div>
          </Card>

          <Card title="Prescription" subtitle="Printable layout in patient history">
            {rx.map((r, i) => (
              <div key={i} className="form-grid" style={{ marginBottom: 8 }}>
                <Field label="Medication"><Input value={r.medication} onChange={(e) => setRx((a) => a.map((x, j) => j === i ? { ...x, medication: e.target.value } : x))} /></Field>
                <Field label="Dosage"><Input value={r.dosage} onChange={(e) => setRx((a) => a.map((x, j) => j === i ? { ...x, dosage: e.target.value } : x))} /></Field>
                <Field label="Frequency"><Input value={r.frequency} onChange={(e) => setRx((a) => a.map((x, j) => j === i ? { ...x, frequency: e.target.value } : x))} /></Field>
                <Field label="Duration"><Input value={r.duration} onChange={(e) => setRx((a) => a.map((x, j) => j === i ? { ...x, duration: e.target.value } : x))} /></Field>
              </div>
            ))}
            <div className="between mt8">
              <Button type="button" variant="ghost" size="sm" onClick={() => setRx((a) => [...a, { medication: '', dosage: '', frequency: '', duration: '' }])}>+ Add medicine</Button>
              <Button size="sm" icon={<Pill size={14} />} onClick={saveRx}>Create Rx</Button>
            </div>
          </Card>

          <Card title="Pending plans" subtitle="Follow up before they go cold">
            <PendingPlans patientId={patientId} />
          </Card>
        </div>
      </div>
    </div>
  )
}

function PendingPlans({ patientId }) {
  const [plans, setPlans] = useState([])
  useEffect(() => {
    api.get(`/patients/${patientId}/treatment-plans`).then(({ data }) => setPlans(data.filter((p) => p.status === 'proposed'))).catch(() => setPlans([{ id: 9, title: 'Whitening + cleaning', status: 'proposed', items: [{ estimated_cost: 10000 }] }]))
  }, [patientId])
  if (!plans.length) return <p className="small muted">No pending plans. Nice.</p>
  return <div>{plans.map((p) => <ListRow key={p.id}><div><b>{p.title}</b><p className="sub">{peso((p.items || []).reduce((s, i) => s + Number(i.estimated_cost || 0), 0))}</p></div><StatusBadge value={p.status} /></ListRow>)}</div>
}
