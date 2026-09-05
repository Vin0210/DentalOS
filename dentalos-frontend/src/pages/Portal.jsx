import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, CalendarDays, ClipboardList, Receipt, UserRound } from 'lucide-react'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { AppointmentModal, patientLabel } from '../components/appointments/BookingForm.jsx'
import { demoAppointments, demoInvoices } from '../services/mock.js'
import { fmtDate, fmtTime, peso } from '../utils/format.js'
import { Button, Card, StatusBadge } from '../components/ui/Ui.jsx'
import './Portal.css'

export default function Portal() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [appts, setAppts] = useState([])
  const [invoices, setInvoices] = useState([])
  const [booking, setBooking] = useState(false)
  const [ownRecord, setOwnRecord] = useState(null)

  const load = async () => {
    try {
      const { data } = await api.get('/appointments', { params: { per_page: 10 } })
      setAppts(data.data)
    } catch { setAppts(demoAppointments) }
    try {
      const { data } = await api.get('/invoices', { params: { per_page: 10 } })
      setInvoices(data.data)
    } catch { setInvoices(demoInvoices) }
  }

  useEffect(() => { load() }, [])

  // Resolve the logged-in patient's own clinic record (email, then name)
  useEffect(() => {
    if (!user) return
    const find = async () => {
      for (const q of [user.email, user.name].filter(Boolean)) {
        try {
          const { data } = await api.get('/patients', { params: { search: q, per_page: 3 } })
          const hit = (data.data || [])[0]
          if (!hit) continue
          if (q === user.email && hit.email !== user.email) continue
          setOwnRecord({ id: hit.id, label: patientLabel(hit) })
          return
        } catch { /* try next key, then leave manual search */ }
      }
    }
    find()
  }, [user])

  const next = appts.find((a) => ['scheduled', 'confirmed'].includes(a.status)) || appts[0]

  return (
    <div className="portal">
      <header className="portal-head">
        <span className="lp-brand"><span className="brand-mark">◈</span> DentalOS</span>
        <div className="row"><Link className="btn ghost sm" to="/app">Staff view</Link><button className="btn secondary sm" onClick={async () => { await logout(); nav('/login', { replace: true }) }}>Sign out</button></div>
      </header>
      <div className="portal-body">
        <h1>Good morning, {user?.name?.split(' ')[0] || 'Juan'}</h1>
        <p className="muted">Here&apos;s your dental care at a glance.</p>

        {next && (
          <Card className="mt16" title="Next appointment" action={<StatusBadge value={next.status} />}>
            <div className="portal-next"><CalendarDays size={28} />
              <div><b>{fmtDate(next.date)} · {fmtTime(next.start_time)}</b><p className="muted">{next.dentist?.user?.name} — {next.procedure?.name || 'Checkup'}</p></div>
              <Link className="btn primary sm" to="/app/appointments">View</Link>
            </div>
          </Card>
        )}

        <div className="grid even2 mt16">
          <Card title="Your dental journey" subtitle="Consultation → diagnosis → treatment → follow-up">
            <div className="journey">
              <div className="journey-track"><motion.i initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }} /></div>
              <div className="journey-steps">
                {['Consultation', 'Diagnosis', 'Treatment', 'Follow-up', 'Smile'].map((s, i) => <span key={s} className={i <= 2 ? 'done' : ''}>{s}</span>)}
              </div>
            </div>
            <p className="small muted">Root canal in progress — next visit: follow-up & crown fitting.</p>
          </Card>
          <Card title="Upcoming visits">
            {appts.slice(0, 4).map((a) => <div key={a.id} className="between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span><b>{fmtDate(a.date)}</b><p className="small muted">{a.procedure?.name}</p></span><StatusBadge value={a.status} /></div>)}
            <div className="mt12"><Button variant="secondary" size="sm" onClick={() => setBooking(true)}>Request appointment</Button></div>
            {!ownRecord && <p className="small muted mt8">Tip: search your name in the booking form to link your record.</p>}
          </Card>
          <Card title="Invoices & payments">
            {invoices.slice(0, 4).map((i) => <div key={i.id} className="between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span><b>{i.invoice_no}</b><p className="small muted">Balance {peso(i.balance)}</p></span><StatusBadge value={i.status} /></div>)}
          </Card>
          <Card title="Treatment plans">
            <div className="row"><ClipboardList size={16} className="muted" /><p className="small">Root Canal + Crown — <b>Accepted</b> · {peso(19500)}</p></div>
          </Card>
          <Card title="Care team">
            <div className="row"><UserRound size={16} className="muted" /><p className="small">Dr. Sofia Mendoza · <span className="muted">Orthodontics</span></p></div>
            <div className="row mt8"><Bell size={16} className="muted" /><p className="small">Reminders on — SMS + email</p></div>
            <div className="row mt8"><Receipt size={16} className="muted" /><p className="small">2 prescriptions on file</p></div>
          </Card>
        </div>
      </div>
      <AppointmentModal
        open={booking}
        initialPatient={ownRecord}
        onClose={(done) => { setBooking(false); if (done) load() }}
      />
    </div>
  )
}
