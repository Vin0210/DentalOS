import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Save, Stethoscope } from 'lucide-react'
import api from '../services/api.js'
import { Odontogram } from '../components/odontogram/Odontogram.jsx'
import { EASE } from '../components/motion/Motion.jsx'
import { SURFACES, TOOTH_CONDITIONS, fmtDate } from '../utils/format.js'
import { Button, Card, Field, Select, StatusBadge, Textarea } from '../components/ui/Ui.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function DentalChart() {
  const { toast } = useTheme()
  const [params] = useSearchParams()
  const [patientId, setPatientId] = useState(params.get('patient') || '1')
  const [records, setRecords] = useState({})
  const [selected, setSelected] = useState('16')
  const [form, setForm] = useState({ condition: 'healthy', surfaces: [], notes: '' })
  const [history, setHistory] = useState([])
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get(`/patients/${patientId}/odontogram`)
      const map = {}
      Object.values(data).forEach((r) => { map[r.tooth_number] = r })
      setRecords(map)
      const rec = map[selected]
      if (rec) setForm({ condition: rec.condition, surfaces: rec.surfaces || [], notes: rec.notes || '' })
    } catch { /* demo: keep local state */ }
    try {
      const { data } = await api.get(`/patients/${patientId}/diagnoses`)
      setHistory(data)
    } catch { setHistory([{ id: 1, tooth_number: '16', title: 'Cavity detected', created_at: new Date(Date.now() - 20 * 864e5).toISOString() }, { id: 2, tooth_number: '16', title: 'Filling completed', created_at: new Date(Date.now() - 13 * 864e5).toISOString() }]) }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- patient-driven data fetch
  useEffect(() => { load() }, [patientId])
  useEffect(() => {
    const rec = records[selected]
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync editor with selected tooth
    setForm({ condition: rec?.condition || 'healthy', surfaces: rec?.surfaces || [], notes: rec?.notes || '' })
  }, [selected])

  const toggleSurface = (s) => setForm((f) => ({ ...f, surfaces: f.surfaces.includes(s) ? f.surfaces.filter((x) => x !== s) : [...f.surfaces, s] }))

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await api.post(`/patients/${patientId}/odontogram`, { tooth_number: selected, ...form })
      setRecords((r) => ({ ...r, [selected]: data }))
      toast(`Tooth #${selected} saved as ${form.condition.replace(/_/g, ' ')}.`, 'success')
    } catch {
      setRecords((r) => ({ ...r, [selected]: { tooth_number: selected, ...form } }))
      toast('Saved locally (demo mode).', 'warning')
    } finally { setSaving(false) }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div><h1 className="page-title">Dental chart</h1><p className="page-sub">Click any tooth to diagnose, mark surfaces & track history</p></div>
        <div className="row">
          <label className="small muted">Patient ID <input className="input" style={{ width: 90 }} value={patientId} onChange={(e) => setPatientId(e.target.value)} /></label>
        </div>
      </div>

      <div className="grid two" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
        <Card title={`Odontogram — patient #${patientId}`} subtitle="FDI numbering · adult dentition">
          <Odontogram records={records} selected={selected} onSelect={setSelected} />
        </Card>

        <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          className="tooth-panel"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <div className="between"><h3 style={{ fontSize: 16 }}>Tooth #{selected}</h3><StatusBadge value={form.condition} /></div>
          <div className="grid mt12" style={{ gap: 12 }}>
            <Field label="Condition">
              <Select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                {TOOTH_CONDITIONS.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </Select>
            </Field>
            <Field label="Surfaces" hint="Mark affected surfaces">
              <div className="surface-grid">{SURFACES.map((s) => <button key={s} type="button" className={form.surfaces.includes(s) ? 'on' : ''} onClick={() => toggleSurface(s)} aria-pressed={form.surfaces.includes(s)}>{s}</button>)}</div>
            </Field>
            <Field label="Clinical note"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Add clinical note…" /></Field>
            <Button icon={<Save size={15} />} loading={saving} onClick={save}>Save tooth</Button>
            <div>
              <p className="small muted" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>History</p>
              <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}>
              {history.filter((h) => !h.tooth_number || h.tooth_number === selected).map((h) => (
                <motion.div key={h.id} variants={{ hidden: { opacity: 0, x: 14 }, show: { opacity: 1, x: 0 } }} style={{ padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                  <div className="small muted">{fmtDate(h.created_at)}</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{h.title}</div>
                </motion.div>
              ))}
              </motion.div>
              {!history.length && <p className="small muted">No history for this tooth.</p>}
            </div>
          </div>
        </motion.div>
        </AnimatePresence>
      </div>

      <Card><div className="row"><Stethoscope size={16} className="muted" /><p className="small muted">Every save is audit-logged with dentist, timestamp and IP. Open the <b>Dentist Workspace</b> for the full visit flow: history → chart → diagnosis → plan → procedure → prescription.</p></div></Card>
    </div>
  )
}
