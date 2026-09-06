import { useEffect, useState } from 'react'
import { Bell, History, Plus, Trash2 } from 'lucide-react'
import api, { resolveAvatar } from '../services/api.js'
import { Avatar, Badge, Button, Card, EmptyState, Field, Input, ListRow, Modal, Select, SkeletonList, StatusBadge } from '../components/ui/Ui.jsx'
import { useAuth } from '../context/AuthContext.jsx'
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
  const markAll = async () => {
    const targets = rows.filter((n) => !n.read_at)
    setRows((r) => r.map((x) => x.read_at ? x : { ...x, read_at: new Date().toISOString() }))
    try { await Promise.all(targets.map((n) => api.post(`/notifications/${n.id}/read`))) } catch { /* already marked locally */ }
  }
  if (loading) return <div className="page"><SkeletonList rows={6} /></div>
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <p className="eyebrow">Inbox</p>
      <h1 className="page-title">Notifications</h1>
      <p className="page-sub">Appointments, payments, stock & follow-ups</p>
      <Card action={rows.some((n) => !n.read_at) ? <Button size="sm" variant="secondary" onClick={markAll}>Mark all read</Button> : null}>
        {!rows.length && <EmptyState icon={<Bell size={20} />} title="All caught up" hint="New events will appear here." />}
        {rows.map((n) => (
          <ListRow key={n.id} onClick={() => markRead(n)} className={`tone-teal${n.read_at ? '' : ' unread'}`}>
            <span className="row">
              <span className="stat-icon"><Bell size={15} /></span>
              <span><b>{n.title}</b><p className="sub">{n.body}</p><span className="small muted">{fmtDate(n.created_at)}</span></span>
            </span>
            {!n.read_at && <Badge tone="primary">new</Badge>}
          </ListRow>
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
      <p className="eyebrow">Security & compliance</p>
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
      <div className="page-head"><div><p className="eyebrow">Team management</p><h1 className="page-title">Dentists & staff</h1><p className="page-sub">{rows.length} members · {dentists.length} dentists</p></div><Button icon={<Plus size={15} />} onClick={() => setOpen(true)}>Add member</Button></div>
      <Card pad={false}><div className="table-wrap"><table className="table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
            <tbody>{rows.map((u) => <tr key={u.id}><td><span className="row"><Avatar name={u.name} size={30} src={u.avatar ? resolveAvatar(u) : undefined} /><b>{u.name}</b></span></td><td className="muted">{u.email}</td><td><StatusBadge value={u.role} /></td></tr>)}</tbody>
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
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ clinic_name: 'DentalOS Smile Studio', currency: '₱', tax_rate: 0, opens_at: '08:00', closes_at: '18:00' })
  const [photo, setPhoto] = useState(null)
  const [savingPhoto, setSavingPhoto] = useState(false)
  const save = async (e) => {
    e.preventDefault()
    try { await api.post('/settings', { settings: form }); toast('Clinic settings saved.', 'success') }
    catch { toast('Saved locally (demo).', 'warning') }
  }

  const applyAvatar = (avatar) => {
    setUser((u) => {
      const next = { ...(u || {}), avatar }
      try { localStorage.setItem('dentalos_user', JSON.stringify(next)) } catch { /* storage full */ }
      return next
    })
  }

  const pickPhoto = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!f.type.startsWith('image/')) { toast('Choose an image file.', 'error'); return }
    if (f.size > 2 * 1024 * 1024) { toast('Image must be under 2 MB.', 'error'); return }
    setPhoto((p) => {
      if (p) URL.revokeObjectURL(p.preview)
      return { file: f, preview: URL.createObjectURL(f) }
    })
  }

  const downscale = (file) => new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => {
      const s = 128 / Math.max(img.width, img.height)
      const c = document.createElement('canvas')
      c.width = Math.max(1, Math.round(img.width * s))
      c.height = Math.max(1, Math.round(img.height * s))
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(img.src)
      res(c.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = rej
    img.src = URL.createObjectURL(file)
  })

  const savePhoto = async () => {
    if (!photo) return
    setSavingPhoto(true)
    try {
      const fd = new FormData()
      fd.append('avatar', photo.file)
      const { data } = await api.post('/auth/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      applyAvatar(data.avatar)
      toast('Profile photo updated.', 'success')
    } catch {
      const url = await downscale(photo.file).catch(() => null)
      if (!url) { toast('Could not read that image.', 'error'); return }
      applyAvatar(url)
      toast('Photo saved locally (demo).', 'warning')
    } finally {
      URL.revokeObjectURL(photo.preview)
      setSavingPhoto(false)
      setPhoto(null)
    }
  }
  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <p className="eyebrow">Configuration</p>
      <h1 className="page-title">Clinic settings</h1>
      <p className="page-sub">Identity, localization, hours & appearance</p>
      <Card title="Profile" subtitle="Your photo shows across the workspace">
        <div className="between wrap">
          <span className="row">
            <Avatar name={user?.name || '?'} size={56} src={photo?.preview || resolveAvatar(user)} />
            <span><b>{user?.name}</b><p className="small muted">{user?.email} · <span className="cap">{user?.role?.replace('_', ' ')}</span></p></span>
          </span>
          <span className="row">
            <label className="btn secondary sm" htmlFor="avatar-file">Choose photo</label>
            <input id="avatar-file" type="file" accept="image/*" className="sr-only" onChange={pickPhoto} />
            {photo && <Button size="sm" loading={savingPhoto} onClick={savePhoto}>Upload</Button>}
          </span>
        </div>
        {photo && <p className="small muted mt8">Preview — click Upload to save.</p>}
      </Card>
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
