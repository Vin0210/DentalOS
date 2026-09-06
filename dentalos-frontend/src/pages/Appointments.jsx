import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import api from '../services/api.js'
import { demoAppointments } from '../services/mock.js'
import { fmtTime } from '../utils/format.js'
import { Button, Card, EmptyState, Modal, Select, StatusBadge } from '../components/ui/Ui.jsx'
import { AppointmentModal, patientLabel } from '../components/appointments/BookingForm.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import './Appointments.css'

const VIEWS = ['day', 'week', 'month']
const STATUSES = ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show']
const NEXT = { scheduled: 'confirmed', confirmed: 'checked_in', checked_in: 'in_progress', in_progress: 'completed' }
const NEXT_LABEL = { confirmed: 'Confirm', checked_in: 'Check in', in_progress: 'Begin treatment', completed: 'Complete' }

export default function Appointments() {
  const { toast } = useTheme()
  const [params] = useSearchParams()
  const [view, setView] = useState('week')
  const [anchor, setAnchor] = useState(new Date())
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [dropDay, setDropDay] = useState(null)
  const [prefill, setPrefill] = useState(null)

  const range = useMemo(() => {
    const d = new Date(anchor)
    if (view === 'day') return [iso(d), iso(d)]
    if (view === 'week') {
      const day = (d.getDay() + 6) % 7
      const mon = new Date(d); mon.setDate(d.getDate() - day)
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
      return [iso(mon), iso(sun)]
    }
    return [iso(new Date(d.getFullYear(), d.getMonth(), 1)), iso(new Date(d.getFullYear(), d.getMonth() + 1, 0))]
  }, [anchor, view])

  const load = async () => {
    try {
      const { data } = await api.get('/appointments', { params: { from: range[0], to: range[1], status: status || undefined, per_page: 100 } })
      setRows(data.data)
    } catch { setRows(demoAppointments) }
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial + range-driven data fetch
  useEffect(() => { load() }, [range, status])

  // Deep-link from patient profile (?patient=ID) preselects that patient
  useEffect(() => {
    const pid = params.get('patient')
    if (!pid) return
    api.get(`/patients/${pid}`).then(({ data }) => setPrefill({ id: data.id, label: patientLabel(data) })).catch(() => setPrefill({ id: pid, label: '' }))
  }, [params])

  const transition = async (appt, to) => {
    try {
      await api.post(`/appointments/${appt.id}/transition`, { status: to })
      toast(`Appointment → ${to.replace(/_/g, ' ')}.`, 'success')
      setDetail(null); setCancelTarget(null); load()
    } catch (err) { toast(err?.response?.data?.message || 'Status change failed.', 'error') }
  }

  const days = useMemo(() => {
    const [f, t] = range.map((d) => new Date(d + 'T00:00'))
    const out = []
    for (let d = new Date(f); d <= t; d.setDate(d.getDate() + 1)) out.push(iso(d))
    return out
  }, [range])

  const moveToDay = async (id, day) => {
    setDragId(null); setDropDay(null)
    const appt = rows.find((r) => String(r.id) === String(id))
    if (!appt || appt.date?.slice(0, 10) === day) return
    const prev = rows
    setRows((r) => r.map((x) => (String(x.id) === String(id) ? { ...x, date: day } : x)))
    try {
      await api.put(`/appointments/${id}`, { date: day })
      toast(`Moved to ${day}. Conflicts re-checked.`, 'success')
    } catch (err) {
      setRows(prev)
      toast(err?.response?.data?.message || Object.values(err?.response?.data?.errors || {})?.[0]?.[0] || 'Move blocked — slot conflict.', 'error')
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div><p className="eyebrow">Scheduling</p><h1 className="page-title">Appointments</h1><p className="page-sub">{range[0]} → {range[1]} · {rows.length} appointments · drag cards between days</p></div>
        <Button icon={<Plus size={15} />} onClick={() => setOpen(true)}>New appointment</Button>
      </div>

      <Card pad={false}>
        <div className="cal-bar">
          <div className="row">
            <button className="icon-btn" onClick={() => shift(-1, view, anchor, setAnchor)} aria-label="Previous period"><ChevronLeft size={16} /></button>
            <Button variant="secondary" size="sm" onClick={() => setAnchor(new Date())}>Today</Button>
            <button className="icon-btn" onClick={() => shift(1, view, anchor, setAnchor)} aria-label="Next period"><ChevronRight size={16} /></button>
            <b className="cal-range">{label(anchor, view)}</b>
          </div>
          <div className="row">
            <div className="seg cap" role="tablist">{VIEWS.map((v) => <button key={v} role="tab" aria-selected={view === v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>{v}</button>)}</div>
            <Select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter status">
              <option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </Select>
          </div>
        </div>

        {view === 'month' ? (
          <div className="month-grid">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => <span key={d} className="dow">{d}</span>)}
            {days.map((d) => (
              <div key={d} className="mcell">
                <b>{Number(d.slice(8))}</b>
                {rows.filter((r) => r.date?.slice(0, 10) === d).slice(0, 3).map((r) => (
                  <button key={r.id} className={`pill ${r.status}`} onClick={() => setDetail(r)}>{fmtTime(r.start_time)} {r.patient?.first_name}</button>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="week-list">
            {days.map((d) => {
              const list = rows.filter((r) => r.date?.slice(0, 10) === d)
              return (
                <div
                  key={d} className={`wday${dropDay === d ? ' droptarget' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDropDay(d) }}
                  onDragLeave={() => setDropDay((x) => (x === d ? null : x))}
                  onDrop={(e) => { e.preventDefault(); moveToDay(e.dataTransfer.getData('text/appt'), d) }}
                >
                  <div className="wday-head"><b>{new Date(d + 'T00:00').toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}</b><span className="muted small">{list.length} appts</span></div>
                  {list.length ? list.map((r) => (
                    <button
                      key={r.id} className={`slot${String(dragId) === String(r.id) ? ' dragging' : ''}`}
                      draggable onDragStart={(e) => { e.dataTransfer.setData('text/appt', String(r.id)); e.dataTransfer.effectAllowed = 'move'; setDragId(r.id) }}
                      onDragEnd={() => { setDragId(null); setDropDay(null) }}
                      onClick={() => setDetail(r)} title="Drag to another day, or click for details"
                    >
                      <span className="slot-time">{fmtTime(r.start_time)}–{fmtTime(r.end_time)}</span>
                      <span className="slot-main"><b>{r.patient?.first_name} {r.patient?.last_name}</b><i>{r.procedure?.name || 'Visit'} · {r.dentist?.user?.name || 'Unassigned'}</i></span>
                      <StatusBadge value={r.status} />
                    </button>
                  )) : <p className="muted small" style={{ padding: '6px 2px' }}>No appointments — drop here to move</p>}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <AppointmentModal
        open={open}
        title="New appointment"
        initialPatient={prefill}
        onClose={(done) => { setOpen(false); if (done) load() }}
      />

      <Modal open={!!detail} title={detail ? `${detail.patient?.first_name} ${detail.patient?.last_name} — ${detail.date}` : ''} onClose={() => setDetail(null)}>
        {detail && (
          <div className="grid gap-12">
            <div className="between"><StatusBadge value={detail.status} /><span className="small muted">{fmtTime(detail.start_time)}–{fmtTime(detail.end_time)}</span></div>
            <p className="small">{detail.procedure?.name || 'Visit'} · {detail.dentist?.user?.name || 'Unassigned dentist'}</p>
            <div className="flow">
              {['scheduled','confirmed','checked_in','in_progress','completed'].map((s, i) => (
                <span key={s} className={`fstep${['scheduled','confirmed','checked_in','in_progress','completed'].indexOf(detail.status) >= i ? ' done' : ''}`}>{s.replace(/_/g, ' ')}</span>
              ))}
            </div>
            <div className="row wrap">
              {NEXT[detail.status] && <Button onClick={() => transition(detail, NEXT[detail.status])}>{NEXT_LABEL[NEXT[detail.status]]}</Button>}
              {!['completed','cancelled','no_show'].includes(detail.status) && <Button variant="secondary" onClick={() => setCancelTarget(detail)}>Cancel</Button>}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!cancelTarget} title="Cancel appointment" onClose={() => setCancelTarget(null)}>
        {cancelTarget && (
          <div className="grid gap-12">
            <p className="small">Cancel <b>{cancelTarget.patient?.first_name} {cancelTarget.patient?.last_name}</b> on <b>{cancelTarget.date}</b> at <b>{fmtTime(cancelTarget.start_time)}</b>? The slot opens up for other patients.</p>
            <div className="between"><span /><div className="row"><Button variant="secondary" onClick={() => setCancelTarget(null)}>Keep appointment</Button><Button variant="danger" onClick={() => transition(cancelTarget, 'cancelled')}>Yes, cancel</Button></div></div>
          </div>
        )}
      </Modal>

      {!rows.length && <Card><EmptyState icon={<Plus size={20} />} title="No appointments in this period" hint="Book the first one to fill the schedule." action={<Button onClick={() => setOpen(true)}>New appointment</Button>} /></Card>}
    </div>
  )
}

const iso = (d) => d.toISOString().slice(0, 10)
function shift(dir, view, anchor, set) {
  const d = new Date(anchor)
  d.setDate(d.getDate() + dir * (view === 'day' ? 1 : view === 'week' ? 7 : 30))
  set(d)
}
function label(anchor, view) {
  return anchor.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) + (view === 'day' ? ` · ${anchor.getDate()}` : '')
}
