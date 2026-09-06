import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import api from '../services/api.js'
import { demoInvoices, demoProcedures } from '../services/mock.js'
import { fmtDate, peso } from '../utils/format.js'
import { Button, Card, EmptyState, Field, Input, Modal, Select, StatusBadge } from '../components/ui/Ui.jsx'
import { AnimatedNumber } from '../components/motion/Motion.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Billing() {
  const { toast } = useTheme()
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState(false)
  const [payTarget, setPayTarget] = useState(null)
  const [procedures, setProcedures] = useState(demoProcedures)
  const [saving, setSaving] = useState(false)
  const [lines, setLines] = useState([{ description: 'Root Canal Treatment', quantity: 1, unit_price: 8000 }])

  const load = async () => {
    try {
      const { data } = await api.get('/invoices', { params: { status: status || undefined, per_page: 30 } })
      setRows(data.data)
    } catch { setRows(demoInvoices.filter((i) => !status || i.status === status)) }
    try {
      const { data } = await api.get('/procedures')
      if (data.length) setProcedures(data)
    } catch { /* demo fallback below */ }
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- filter-driven data fetch
  useEffect(() => { load() }, [status])

  const lineTotal = lines.reduce((s, l) => s + l.quantity * Number(l.unit_price || 0), 0)

  const create = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    setSaving(true)
    try {
      await api.post('/invoices', {
        patient_id: Number(fd.get('patient_id')), discount: Number(fd.get('discount') || 0),
        items: lines.map((l) => ({ ...l, quantity: Number(l.quantity), unit_price: Number(l.unit_price) })),
      })
      toast('Invoice issued.', 'success'); setOpen(false); load()
    } catch (err) { toast(err?.response?.data?.message || 'Could not create invoice.', 'error') }
    finally { setSaving(false) }
  }

  const pay = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    try {
      await api.post(`/invoices/${payTarget.id}/pay`, { amount: Number(fd.get('amount')), method: fd.get('method') })
      toast(`Payment of ${peso(fd.get('amount'))} recorded.`, 'success')
      setPayTarget(null); load()
    } catch (err) { toast(err?.response?.data?.message || 'Payment failed.', 'error') }
  }

  const outstanding = rows.filter((r) => ['unpaid', 'partial'].includes(r.status)).reduce((s, r) => s + Number(r.balance ?? r.total - r.paid), 0)

  return (
    <div className="page">
      <div className="page-head">
        <div><p className="eyebrow">Billing & payments</p><h1 className="page-title">Billing</h1><p className="page-sub">Outstanding <b><AnimatedNumber value={outstanding} format={(v) => peso(v)} /></b> across {rows.length} invoices</p></div>
        <Button icon={<Plus size={15} />} onClick={() => setOpen(true)}>New invoice</Button>
      </div>

      <Card pad={false}>
        <div className="ptoolbar">
          <Select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option><option value="unpaid">Unpaid</option><option value="partial">Partial</option><option value="paid">Paid</option>
          </Select>
        </div>
        {rows.length ? (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Invoice</th><th>Patient</th><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th /></tr></thead>
            <tbody>{rows.map((inv) => (
              <tr key={inv.id}>
                <td><b>{inv.invoice_no}</b></td>
                <td>{inv.patient ? `${inv.patient.first_name} ${inv.patient.last_name}` : `#${inv.patient_id}`}</td>
                <td className="muted">{fmtDate(inv.created_at)}</td>
                <td><b>{peso(inv.total)}</b></td><td className="muted">{peso(inv.paid)}</td>
                <td><b className={Number(inv.balance) > 0 ? 'text-danger' : 'text-success'}>{peso(inv.balance)}</b></td>
                <td><StatusBadge value={inv.status} /></td>
                <td>{Number(inv.balance) > 0 && <Button variant="secondary" size="sm" onClick={() => setPayTarget(inv)}>Record payment</Button>}</td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <EmptyState icon={<Plus size={20} />} title="No invoices" hint="Issue the first invoice to get paid." action={<Button onClick={() => setOpen(true)}>New invoice</Button>} />}
      </Card>

      <Modal open={open} title="New invoice" onClose={() => setOpen(false)} wide>
        <form onSubmit={create}>
          <div className="form-grid">
            <Field label="Patient ID"><Input name="patient_id" type="number" min={1} required /></Field>
            <Field label="Discount (₱)"><Input name="discount" type="number" min={0} defaultValue={0} /></Field>
          </div>
          {lines.map((l, i) => (
            <div key={i} className="form-grid mt8">
              <Field label="Description"><Input value={l.description} onChange={(e) => setLines((a) => a.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} /></Field>
              <Field label="Qty"><Input type="number" min={1} value={l.quantity} onChange={(e) => setLines((a) => a.map((x, j) => j === i ? { ...x, quantity: Number(e.target.value) } : x))} /></Field>
              <Field label="Unit price"><Input type="number" min={0} value={l.unit_price} onChange={(e) => setLines((a) => a.map((x, j) => j === i ? { ...x, unit_price: e.target.value } : x))} /></Field>
              <Field label="Procedure (optional)"><Select onChange={(e) => {
                const p = procedures.find((x) => String(x.id) === e.target.value)
                if (p) setLines((a) => a.map((x, j) => j === i ? { ...x, description: p.name, unit_price: p.default_price } : x))
              }}><option value="">—</option>{procedures.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" className="mt8" onClick={() => setLines((a) => [...a, { description: '', quantity: 1, unit_price: 0 }])}>+ Add line</Button>
          <div className="between mt16"><b>Total: {peso(lineTotal)}</b><Button loading={saving} type="submit">Issue invoice</Button></div>
        </form>
      </Modal>

      <Modal open={!!payTarget} title={payTarget ? `Payment — ${payTarget.invoice_no} (bal ${peso(payTarget.balance)})` : ''} onClose={() => setPayTarget(null)}>
        {payTarget && (
          <form onSubmit={pay}>
            <div className="form-grid">
              <Field label="Amount (₱)"><Input name="amount" type="number" min={1} max={Number(payTarget.balance)} required defaultValue={payTarget.balance} /></Field>
              <Field label="Method"><Select name="method" defaultValue="cash"><option value="cash">Cash</option><option value="card">Card</option><option value="bank_transfer">Bank transfer</option><option value="e_wallet">E-wallet</option><option value="other">Other</option></Select></Field>
            </div>
            <div className="between mt16"><span /><Button type="submit">Record payment</Button></div>
          </form>
        )}
      </Modal>
    </div>
  )
}
