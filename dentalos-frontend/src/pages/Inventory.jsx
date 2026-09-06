import { useEffect, useState } from 'react'
import { AlertTriangle, PackagePlus, Search } from 'lucide-react'
import api from '../services/api.js'
import { demoInventory } from '../services/mock.js'
import { peso } from '../utils/format.js'
import { Badge, Button, Card, EmptyState, Field, Input, ListRow, Modal, Select, StatusBadge } from '../components/ui/Ui.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Inventory() {
  const { toast } = useTheme()
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [adjust, setAdjust] = useState(null)
  const [suppliers, setSuppliers] = useState([])

  const load = async () => {
    try {
      const { data } = await api.get('/inventory', { params: { search: search || undefined, low_stock: filter === 'low' ? 1 : undefined, per_page: 30 } })
      setRows(data.data)
    } catch {
      let r = demoInventory
      if (filter === 'low') r = r.filter((x) => x.is_low_stock)
      if (search) r = r.filter((x) => x.name.toLowerCase().includes(search.toLowerCase()))
      setRows(r)
    }
    try {
      const { data } = await api.get('/suppliers')
      setSuppliers(data)
    } catch { setSuppliers([{ id: 1, name: 'MediDental Supplies Inc.' }]) }
  }
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [filter, search])

  const create = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    try {
      await api.post('/inventory', { name: fd.get('name'), sku: fd.get('sku'), unit: fd.get('unit') || 'pcs', quantity: Number(fd.get('quantity') || 0), min_stock: Number(fd.get('min_stock') || 0), cost: Number(fd.get('cost') || 0) })
      toast('Item added to inventory.', 'success'); setOpen(false); load()
    } catch (err) { toast(err?.response?.data?.message || 'Could not add item.', 'error') }
  }

  const doAdjust = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    try {
      await api.post(`/inventory/${adjust.id}/adjust`, { type: fd.get('type'), quantity: Number(fd.get('quantity')), notes: fd.get('notes') })
      toast('Stock updated.', 'success'); setAdjust(null); load()
    } catch { toast('Adjustment failed (demo mode).', 'warning') }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div><p className="eyebrow">Inventory & suppliers</p><h1 className="page-title">Inventory</h1><p className="page-sub">{rows.filter((r) => r.is_low_stock ?? r.quantity <= r.min_stock).length} low-stock alerts</p></div>
        <Button icon={<PackagePlus size={15} />} onClick={() => setOpen(true)}>Add item</Button>
      </div>

      <Card pad={false}>
        <div className="ptoolbar">
          <div className="search-input"><Search size={15} /><Input placeholder="Search SKU or name…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search inventory" /></div>
          <div className="seg">
            {[['', 'All'], ['low', 'Low stock']].map(([v, l]) => <button key={v} className={filter === v ? 'active' : ''} onClick={() => setFilter(v)}>{l}</button>)}
          </div>
        </div>
        {rows.length ? (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Item</th><th>SKU</th><th>Stock</th><th>Min</th><th>Cost</th><th>Price</th><th>Status</th><th /></tr></thead>
            <tbody>{rows.map((it) => {
              const low = it.is_low_stock ?? it.quantity <= it.min_stock
              return (
                <tr key={it.id}>
                  <td><b>{it.name}</b><p className="small muted">{it.category?.name} · per {it.unit}</p></td>
                  <td className="muted">{it.sku}</td>
                  <td><b className={low ? 'text-danger' : undefined}>{it.quantity} {it.unit}</b></td>
                  <td className="muted">{it.min_stock}</td>
                  <td>{peso(it.cost)}</td><td>{peso(it.price)}</td>
                  <td>{low ? <Badge tone="danger">Low stock</Badge> : <Badge tone="success">OK</Badge>}</td>
                  <td><Button variant="secondary" size="sm" onClick={() => setAdjust(it)}>Adjust</Button></td>
                </tr>
              )
            })}</tbody>
          </table></div>
        ) : <EmptyState icon={<AlertTriangle size={20} />} title="No items" hint="Add your first supply to start tracking stock." action={<Button onClick={() => setOpen(true)}>Add item</Button>} />}
      </Card>

      <Card title="Suppliers" subtitle="Purchase history & reordering">
        {suppliers.map((s) => <ListRow key={s.id}><div><b>{s.name}</b><p className="sub">{s.phone || s.email || '—'}</p></div><StatusBadge value="active" /></ListRow>)}
      </Card>

      <Modal open={open} title="Add inventory item" onClose={() => setOpen(false)}>
        <form onSubmit={create}>
          <div className="form-grid">
            <Field label="Name"><Input name="name" required /></Field>
            <Field label="SKU"><Input name="sku" required /></Field>
            <Field label="Quantity"><Input name="quantity" type="number" min={0} defaultValue={0} /></Field>
            <Field label="Min stock"><Input name="min_stock" type="number" min={0} defaultValue={5} /></Field>
            <Field label="Cost (₱)"><Input name="cost" type="number" min={0} defaultValue={0} /></Field>
            <Field label="Unit"><Input name="unit" defaultValue="pcs" /></Field>
          </div>
          <div className="between mt16"><span /><Button type="submit">Add item</Button></div>
        </form>
      </Modal>

      <Modal open={!!adjust} title={adjust ? `Adjust — ${adjust.name}` : ''} onClose={() => setAdjust(null)}>
        {adjust && (
          <form onSubmit={doAdjust}>
            <div className="form-grid">
              <Field label="Type"><Select name="type" defaultValue="in"><option value="in">Stock in</option><option value="out">Stock out</option></Select></Field>
              <Field label="Quantity"><Input name="quantity" type="number" min={0.01} step="0.01" required /></Field>
              <Field label="Notes" ><Input name="notes" placeholder="PO number, reason…" /></Field>
            </div>
            <div className="between mt16"><span /><Button type="submit">Apply</Button></div>
          </form>
        )}
      </Modal>
    </div>
  )
}
