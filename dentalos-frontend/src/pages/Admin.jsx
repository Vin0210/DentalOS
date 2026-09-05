import { useEffect, useState } from 'react'
import { Bell, History, Plus, Trash2 } from 'lucide-react'
import api from '../services/api.js'
import { Avatar, Button, Card, EmptyState, Field, Input, Modal, Select, SkeletonList, StatusBadge } from '../components/ui/Ui.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { fmtDate } from '../utils/format.js'

export function Notifications() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/notifications').then(({ data }) => setRows(data.data)).catch(() => setRows([
      { id: 1, title: 'Appointment confirmed', body: 'Maria Santos — today 9:00 AM', created_at: new Date().toISOString(), read_at: null },
      { id: 2, title: 'Low stock alert', body: 'Latex Gloves below minimum (24/30)', created_at: new Date().toISOString(), read_at: null },
      { id: 3, title: 'Payment received', body: '₱3,000 for INV-000031', created_at: new Date(Date.now() - 864e5).toISOString(), read_at: new Date().toISOString() },
    ])).finally(() => setLoading(false))
  }, [])
  const markRead = async (n) => {
    setRows((r) => r.map((x) => x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x))
    try { await api.post(`/notifications/${n.id}/read`) } catch { /* offline: already marked locally */ }
  }
  if (loading) return <div className="page"><SkeletonList rows={6} /></div>
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <h1 className="page-title">Notifications</h1>
      <p className="page-sub">Appointments, payments, stock & follow-ups</p>
      <Card>
        {!rows.length && <EmptyState icon={<Bell size={20} />} title="All caught up" hint="New events will appear here." />}
        {rows.map((n) => (
          <button key={n.id} onClick={() => markRead(n)} style={{ display: 'flex', gap: 12, width: '100%', textAlign: 'left', background: n.read_at ? 'none' : 'var(--primary-soft)', border: 'none', borderRadius: 10, padding: '12px', marginBottom: 6, cursor: 'pointer', color: 'var(--text-primary)' }}>
            <Bell size={17} style={{ flexShrink: 0, marginTop: 2, color: 'var(--primary)' }} />
            <span style={{ flex: 1 }}><b style={{ fontSize: 13.5 }}>{n.title}</b><p className="small muted">{n.body}</p><span className="small muted">{fmtDate(n.created_at)}</span></span>
            {!n.read_at && <span className="badge primary">new</span>}
          </button>
        ))}
      </Card>
    </div>
  )
}

export function Audit() {
  const [rows, setRows] = useState([])
  useEffect(() => {
    api.get('/audit-logs').then(({ data }) => setRows(data.data)).catch(() => setRows([
      { id: 1, action: 'create', entity: 'treatment_plans', entity_id: 12, description: 'Dr. Sofia created treatment plan', created_at: new Date().toISOString(), user: { name: 'Dr. Sofia Mendoza' } },
      { id: 2, action: 'payment', entity: 'invoices', entity_id: 31, description: 'Accountant recorded payment', created_at: new Date().toISOString(), user: { name: 'Mark Villanueva' } },
    ]))
  }, [])
  return (
    <div className="page">
      <h1 className="page-title">Audit log</h1>
      <p className="page-sub">Who changed what, and when</p>
      <Card pad={false}><div className="table-wrap"><table className="table">
        <thead><tr><th>When</th><th>User</th><th>Action</th><th>Details</th></tr></thead>
        <tbody>{rows.map((l) => <tr key={l.id}><td className="muted">{fmtDate(l.created_at)}</td><td><b>{l.user?.name || 'System'}</b></td><td><StatusBadge value={l.action} /></td><td className="muted">{l.description}</td></tr>)}</tbody>
      </table></div></Card>
    </div>
  )
}

export function Team() {
  const { toast } = useTheme()
  const [rows, setRows] = useState([])
  const [dentists, setDentists] = useState([])
  const [open, setOpen] = useState(false)
  useEffect(() => {
    api.get('/staff', { params: { per_page: 50 } }).then(({ data }) => setRows(data.data)).catch(() => setRows([
      { id: 1, name: 'Maria Santos', email: 'admin@dentalos.ph', role: 'clinic_admin' },
      { id: 2, name: 'Dr. Sofia Mendoza', email: 'sofia@dentalos.ph', role: 'dentist' },
      { id: 3, name: 'Ana Reyes', email: 'reception@dentalos.ph', role: 'receptionist' },
    ]))
    api.get('/dentists').then(({ data }) => setDentists(data)).catch(() => setDentists([]))
  }, [])
  const create = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    try {
      await api.post('/staff', Object.fromEntries(fd.entries()))
      toast('Team member added.', 'success'); setOpen(false)
    } catch (err) { toast(err?.response?.data?.message || 'Could not add member.', 'error') }
  }
  return (
    <div className="page">
      <div className="page-head"><div><h1 className="page-title">Dentists & staff</h1><p className="page-sub">{rows.length} members · {dentists.length} dentists</p></div><Button icon={<Plus size={15} />} onClick={() => setOpen(true)}>Add member</Button></div>
      <Card pad={false}><div className="table-wrap"><table className="table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>{rows.map((u) => <tr key={u.id}><td><span className="row"><Avatar name={u.name} size={30} /><b>{u.name}</b></span></td><td className="muted">{u.email}</td><td><StatusBadge value={u.role} /></td></tr>)}</tbody>
      </table></div></Card>
      <Modal open={open} title="Add team member" onClose={() => setOpen(false)}>
        <form onSubmit={create}>
          <div className="form-grid">
            <Field label="Name"><Input name="name" required /></Field>
            <Field label="Email"><Input name="email" type="email" required /></Field>
            <Field label="Password"><Input name="password" type="password" required /></Field>
            <Field label="Role"><Select name="role" defaultValue="receptionist"><option value="clinic_admin">Clinic admin</option><option value="dentist">Dentist</option><option value="receptionist">Receptionist</option><option value="accountant">Accountant</option></Select></Field>
          </div>
          <div className="between mt16"><span /><Button type="submit">Add</Button></div>
        </form>
      </Modal>
    </div>
  )
}

export function Settings() {
  const { toast, theme, toggleTheme } = useTheme()
  const [form, setForm] = useState({ clinic_name: 'DentalOS Smile Studio', currency: '₱', tax_rate: 0, opens_at: '08:00', closes_at: '18:00' })
  const save = async (e) => {
    e.preventDefault()
    try { await api.post('/settings', { settings: form }); toast('Clinic settings saved.', 'success') }
    catch { toast('Saved locally (demo).', 'warning') }
  }
  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <h1 className="page-title">Clinic settings</h1>
      <p className="page-sub">Identity, localization, hours & appearance</p>
      <Card title="General">
        <form onSubmit={save}>
          <div className="form-grid">
            <Field label="Clinic name"><Input value={form.clinic_name} onChange={(e) => setForm({ ...form, clinic_name: e.target.value })} /></Field>
            <Field label="Currency"><Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}><option value="₱">₱ PHP</option><option value="$">$ USD</option></Select></Field>
            <Field label="Opens"><Input type="time" value={form.opens_at} onChange={(e) => setForm({ ...form, opens_at: e.target.value })} /></Field>
            <Field label="Closes"><Input type="time" value={form.closes_at} onChange={(e) => setForm({ ...form, closes_at: e.target.value })} /></Field>
          </div>
          <div className="between mt16"><Button variant="secondary" type="button" onClick={toggleTheme}>{theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}</Button><Button type="submit">Save settings</Button></div>
        </form>
      </Card>
      <Card title="Danger zone" subtitle="Archived records stay recoverable for 30 days">
        <div className="row"><Trash2 size={15} className="muted" /><p className="small muted">Patient archiving uses soft deletes — nothing is ever hard-deleted from the UI.</p></div>
      </Card>
      <p className="small muted mt12 row"><History size={14} /> <a href="/app/audit">View audit log →</a></p>
    </div>
  )
}
