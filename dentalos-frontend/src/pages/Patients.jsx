import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, UserPlus } from 'lucide-react'
import api from '../services/api.js'
import { demoPatients } from '../services/mock.js'
import { fmtDate } from '../utils/format.js'
import { Avatar, Button, Card, EmptyState, Field, Input, Modal, Select, SkeletonList, StatusBadge } from '../components/ui/Ui.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import './Patients.css'

export default function Patients() {
  const { toast } = useTheme()
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/patients', { params: { search, status, page, per_page: 12 } })
      setRows(data.data); setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total })
    } catch {
      const f = demoPatients.filter((p) => !search || (p.full_name + p.patient_no).toLowerCase().includes(search.toLowerCase()))
      setRows(f.slice((page - 1) * 12, page * 12)); setMeta({ current_page: page, last_page: Math.ceil(f.length / 12), total: f.length })
    } finally { setLoading(false) }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- page/search-driven data fetch
  useEffect(() => { load() }, [page])
  useEffect(() => { const t = setTimeout(() => { setPage(1); load() }, 350); return () => clearTimeout(t) }, [search, status])

  const create = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    setSaving(true)
    try {
      const { data } = await api.post('/patients', Object.fromEntries(fd.entries()))
      toast(`Patient ${data.patient_no} registered.`, 'success')
      setOpen(false); load()
    } catch (err) {
      toast(err?.response?.data?.message || 'Could not register patient.', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div><p className="eyebrow">Patient management</p><h1 className="page-title">Patients</h1><p className="page-sub">{meta?.total ?? '—'} patients · search, filter & open a profile</p></div>
        <Button icon={<Plus size={15} />} onClick={() => setOpen(true)}>Register patient</Button>
      </div>

      <Card pad={false}>
        <div className="ptoolbar">
          <div className="search-input"><Search size={15} /><Input placeholder="Search name, ID, phone…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search patients" /></div>
          <Select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
          </Select>
        </div>
        {loading ? <div style={{ padding: 18 }}><SkeletonList rows={8} /></div> : rows.length ? (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Patient</th><th>ID</th><th>Age · Gender</th><th>Contact</th><th>Last visit</th><th>Status</th></tr></thead>
            <tbody>{rows.map((p) => (
              <tr key={p.id}>
                <td><Link to={`/app/patients/${p.id}`} className="plink"><Avatar name={`${p.first_name} ${p.last_name}`} size={32} /><b>{p.first_name} {p.last_name}</b></Link></td>
                <td className="muted">{p.patient_no}</td>
                <td>{p.age ?? '—'} · <span className="cap">{p.gender}</span></td>
                <td className="muted">{p.phone || p.email || '—'}</td>
                <td className="muted">{fmtDate(p.last_visit_at)}</td>
                <td><StatusBadge value={p.status} /></td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <EmptyState icon={<UserPlus size={20} />} title="No patients found" hint="Try a different search or register a new patient." action={<Button onClick={() => setOpen(true)}>Register patient</Button>} />}
        {meta?.last_page > 1 && (
          <div className="pager">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="small muted">Page {meta.current_page} of {meta.last_page}</span>
            <Button variant="secondary" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </Card>

      <Modal open={open} title="Register patient" onClose={() => setOpen(false)} wide>
        <form onSubmit={create}>
          <div className="form-grid">
            <Field label="First name"><Input name="first_name" required /></Field>
            <Field label="Last name"><Input name="last_name" required /></Field>
            <Field label="Date of birth"><Input name="date_of_birth" type="date" /></Field>
            <Field label="Gender"><Select name="gender" defaultValue="male"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></Select></Field>
            <Field label="Phone"><Input name="phone" placeholder="+63…" /></Field>
            <Field label="Email"><Input name="email" type="email" /></Field>
            <Field label="Address" ><Input name="address" /></Field>
            <Field label="Emergency contact"><Input name="emergency_name" /></Field>
          </div>
          <div className="between mt16"><span /><Button loading={saving} type="submit">Register</Button></div>
        </form>
      </Modal>
    </div>
  )
}
