import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import api from '../services/api.js'
import { demoProcedures } from '../services/mock.js'
import { peso } from '../utils/format.js'
import { Button, Card, EmptyState, Field, Input, ListRow, Modal, Select, StatusBadge } from '../components/ui/Ui.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Treatments() {
  const { toast } = useTheme()
  const [params] = useSearchParams()
  const [patientId, setPatientId] = useState(params.get('patient') || '1')
  const [plans, setPlans] = useState([])
  const [procedures, setProcedures] = useState(demoProcedures)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([{ procedure_id: '', tooth_number: '16', priority: 'high', estimated_cost: 8000 }])
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get(`/patients/${patientId}/treatment-plans`)
      setPlans(data)
    } catch { setPlans([{ id: 1, title: 'Comprehensive Care Plan', status: 'accepted', discount: 500, items: [{ id: 1, procedure: { name: 'Root Canal' }, tooth_number: '16', priority: 'high', estimated_cost: 8000, status: 'accepted' }, { id: 2, procedure: { name: 'Crown' }, tooth_number: '16', priority: 'medium', estimated_cost: 12000, status: 'accepted' }] }]) }
    try {
      const { data } = await api.get('/procedures')
      if (data.length) setProcedures(data)
    } catch { /* keep demo procedures */ }
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- patient-driven data fetch
  useEffect(() => { load() }, [patientId])

  const total = (plan) => Math.max(0, (plan.items || []).reduce((s, i) => s + Number(i.estimated_cost || 0), 0) - Number(plan.discount || 0))

  const create = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    setSaving(true)
    try {
      await api.post(`/patients/${patientId}/treatment-plans`, {
        title: fd.get('title'), notes: fd.get('notes'),
        items: items.filter((i) => i.procedure_id).map((i) => ({ ...i, procedure_id: Number(i.procedure_id), estimated_cost: Number(i.estimated_cost) })),
      })
      toast('Treatment plan proposed.', 'success')
      setOpen(false); load()
    } catch (err) { toast(err?.response?.data?.message || 'Could not create plan.', 'error') }
    finally { setSaving(false) }
  }

  const setStatus = async (plan, status) => {
    try {
      await api.post(`/treatment-plans/${plan.id}/status`, { status })
      toast(`Plan ${status}.`, 'success'); load()
    } catch { toast('Status change failed (demo mode).', 'warning') }
  }

  const pickProc = (idx, pid) => {
    const p = procedures.find((x) => String(x.id) === String(pid))
    setItems((arr) => arr.map((it, i) => i === idx ? { ...it, procedure_id: pid, estimated_cost: p ? p.default_price : it.estimated_cost } : it))
  }

  return (
    <div className="page">
      <div className="page-head">
        <div><p className="eyebrow">Treatment planning</p><h1 className="page-title">Treatment planning</h1><p className="page-sub">Propose → accept → complete, with automatic totals</p></div>
        <div className="row">
          <label className="small muted mini-field">Patient <Input value={patientId} onChange={(e) => setPatientId(e.target.value)} /></label>
          <Button icon={<Plus size={15} />} onClick={() => setOpen(true)}>New plan</Button>
        </div>
      </div>

      <div className="grid even2">
        {plans.map((plan) => (
          <Card key={plan.id} title={plan.title} subtitle={`Plan #${plan.id}${plan.discount ? ` · discount ${peso(plan.discount)}` : ''}`} action={<StatusBadge value={plan.status} />}>
            {(plan.items || []).map((it) => (
              <ListRow key={it.id}>
                <div><b>{it.procedure?.name || 'Procedure'}</b><p className="sub">Tooth #{it.tooth_number || '—'} · {it.priority} priority</p></div>
                <b>{peso(it.estimated_cost)}</b>
              </ListRow>
            ))}
            <div className="between mt12"><span className="muted small">Estimated total</span><b style={{ fontSize: 18 }}>{peso(total(plan))}</b></div>
            <div className="row wrap mt12">
              {plan.status === 'proposed' && <><Button size="sm" onClick={() => setStatus(plan, 'accepted')}>Accept plan</Button><Button size="sm" variant="secondary" onClick={() => setStatus(plan, 'declined')}>Decline</Button></>}
              {plan.status === 'accepted' && <Button size="sm" onClick={() => setStatus(plan, 'in_progress')}>Start treatment</Button>}
              {plan.status === 'in_progress' && <Button size="sm" onClick={() => setStatus(plan, 'completed')}>Mark completed</Button>}
            </div>
          </Card>
        ))}
      </div>
      {!plans.length && <Card><EmptyState icon={<Plus size={20} />} title="No treatment plans" hint="Create the first plan for this patient." action={<Button onClick={() => setOpen(true)}>New plan</Button>} /></Card>}

      <Modal open={open} title={`New plan — patient #${patientId}`} onClose={() => setOpen(false)} wide>
        <form onSubmit={create}>
          <div className="form-grid">
            <Field label="Plan title" ><Input name="title" required placeholder="e.g. Root canal + crown, tooth #16" /></Field>
            <Field label="Notes"><Input name="notes" placeholder="Optional" /></Field>
          </div>
          <p className="eyebrow mt12">Items</p>
          {items.map((it, i) => (
            <div key={i} className="form-grid mt8">
              <Field label="Procedure"><Select value={it.procedure_id} onChange={(e) => pickProc(i, e.target.value)} required><option value="">Select…</option>{procedures.map((p) => <option key={p.id} value={p.id}>{p.name} · {peso(p.default_price)}</option>)}</Select></Field>
              <Field label="Tooth"><Input value={it.tooth_number} onChange={(e) => setItems((a) => a.map((x, j) => j === i ? { ...x, tooth_number: e.target.value } : x))} /></Field>
              <Field label="Priority"><Select value={it.priority} onChange={(e) => setItems((a) => a.map((x, j) => j === i ? { ...x, priority: e.target.value } : x))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></Select></Field>
              <Field label="Cost (₱)"><Input type="number" min={0} value={it.estimated_cost} onChange={(e) => setItems((a) => a.map((x, j) => j === i ? { ...x, estimated_cost: e.target.value } : x))} /></Field>
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" className="mt8" onClick={() => setItems((a) => [...a, { procedure_id: '', tooth_number: '', priority: 'medium', estimated_cost: 0 }])}>+ Add item</Button>
          <div className="between mt16"><b>Total: {peso(items.reduce((s, i) => s + Number(i.estimated_cost || 0), 0))}</b><Button loading={saving} type="submit">Propose plan</Button></div>
        </form>
      </Modal>
    </div>
  )
}
