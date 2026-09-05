import { useEffect, useRef, useState } from 'react'
import { Check, Search } from 'lucide-react'
import api from '../../services/api.js'
import { demoPatients } from '../../services/mock.js'
import { Button, Field, Input, Modal, Select } from '../ui/Ui.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'

export function patientLabel(p) {
  const name = p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || `#${p.id}`
  return `${name} · ${p.patient_no || ''}`.trim()
}

async function searchPatients(q) {
  try {
    const { data } = await api.get('/patients', { params: { search: q, per_page: 6 } })
    return data.data || []
  } catch {
    const s = q.toLowerCase()
    return demoPatients.filter((p) => (p.full_name + ' ' + p.patient_no).toLowerCase().includes(s)).slice(0, 6)
  }
}

// Search-as-you-type patient selector. value = patient id.
export function PatientPicker({ value, onChange, initialLabel, autoFocus }) {
  const [q, setQ] = useState('')
  const [options, setOptions] = useState([])
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState(initialLabel || '')
  const boxRef = useRef(null)

  useEffect(() => {
    if (initialLabel) setLabel(initialLabel)
  }, [initialLabel])

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false) }
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [open ])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(async () => setOptions(await searchPatients(q || '')), 250)
    return () => clearTimeout(t)
  }, [q, open])

  const pick = (p) => {
    onChange(p.id)
    setLabel(patientLabel(p))
    setOpen(false)
  }

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <div className="search-input" style={{ maxWidth: 'none' }}>
        <Search size={15} />
        <input
          className="input" value={open ? q : label} placeholder={value ? label : 'Search patient name or ID…'}
          autoFocus={autoFocus}
          onFocus={() => { setQ(''); setOpen(true) }}
          onChange={(e) => { setQ(e.target.value); setOpen(true); if (!e.target.value) { onChange(''); setLabel('') } }}
          aria-label="Search patient"
        />
      </div>
      {open && (
        <div className="picker-pop" role="listbox">
          {options.map((p) => (
            <button type="button" key={p.id} onClick={() => pick(p)}>
              <b>{p.full_name || `${p.first_name} ${p.last_name}`}</b>
              <span className="muted small">{p.patient_no}{p.phone ? ` · ${p.phone}` : ''}</span>
              {String(value) === String(p.id) && <Check size={14} />}
            </button>
          ))}
          {!options.length && <span className="muted small" style={{ padding: 10 }}>No matches — try another name.</span>}
        </div>
      )}
      <style>{`.picker-pop{position:absolute;top:calc(100% + 6px);left:0;right:0;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-lg);z-index:50;max-height:240px;overflow:auto;padding:6px;display:flex;flex-direction:column}.picker-pop button{display:flex;gap:8px;align-items:center;border:none;background:none;text-align:left;padding:9px 10px;border-radius:8px;cursor:pointer;color:var(--text-primary);font-size:13px}.picker-pop button:hover{background:var(--surface-secondary)}.picker-pop button b{flex:1}`}</style>
    </div>
  )
}

// Full booking dialog reused by staff calendar, quick-book and patient portal.
export function AppointmentModal({ open, onClose, initialPatient, title = 'Request appointment' }) {
  const { toast } = useTheme()
  const [patientId, setPatientId] = useState(initialPatient?.id || '')
  const [patientLabelText, setPatientLabelText] = useState(initialPatient?.label || '')
  const [dentists, setDentists] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setPatientId(initialPatient?.id || '')
      setPatientLabelText(initialPatient?.label || '')
      api.get('/dentists').then(({ data }) => setDentists(data)).catch(() => setDentists([
        { id: 1, name: 'Dr. Sofia Mendoza' }, { id: 2, name: 'Dr. Miguel Torres' }, { id: 3, name: 'Dr. Isabel Navarro' },
      ]))
    }
  }, [open, initialPatient])

  const submit = async (e) => {
    e.preventDefault()
    if (!patientId) { toast('Please choose a patient first.', 'warning'); return }
    const fd = new FormData(e.target)
    setSaving(true)
    try {
      const { data } = await api.post('/appointments', {
        patient_id: Number(patientId),
        dentist_id: fd.get('dentist_id') ? Number(fd.get('dentist_id')) : null,
        date: fd.get('date'), start_time: fd.get('start_time'), end_time: fd.get('end_time'),
        notes: fd.get('notes') || undefined,
      })
      toast(`Appointment requested for ${fd.get('date')} at ${String(fd.get('start_time')).slice(0, 5)}.`, 'success')
      onClose(true, data)
    } catch (err) {
      const msg = err?.response?.data?.message
        || (err?.response?.data?.errors ? Object.values(err.response.data.errors)[0]?.[0] : null)
        || 'Booking failed. Please check the details.'
      toast(msg, 'error')
    } finally { setSaving(false) }
  }

  return (
    <Modal open={open} title={title} onClose={() => onClose(false)} wide>
      <form onSubmit={submit}>
        <div className="form-grid">
          <Field label="Patient" ><PatientPicker value={patientId} onChange={setPatientId} initialLabel={patientLabelText} autoFocus /></Field>
          <Field label="Dentist (optional)">
            <Select name="dentist_id" defaultValue="">
              <option value="">Any available dentist</option>
              {dentists.map((d) => <option key={d.id} value={d.id}>{d.user?.name || d.name} {d.specialization ? `· ${d.specialization}` : ''}</option>)}
            </Select>
          </Field>
          <Field label="Date"><Input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} min={new Date().toISOString().slice(0, 10)} /></Field>
          <div />
          <Field label="Start"><Input name="start_time" type="time" required defaultValue="09:00" /></Field>
          <Field label="End"><Input name="end_time" type="time" required defaultValue="09:30" /></Field>
          <Field label="Reason for visit" ><Input name="notes" placeholder="Cleaning, toothache, follow-up…" /></Field>
        </div>
        <div className="between mt16">
          <span className="small muted">Dentist & room conflicts are checked automatically.</span>
          <Button loading={saving} type="submit">Send request</Button>
        </div>
      </form>
    </Modal>
  )
}
