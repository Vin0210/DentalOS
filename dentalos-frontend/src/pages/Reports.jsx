import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from 'recharts'
import api from '../services/api.js'
import { demoDashboard } from '../services/mock.js'
import { peso } from '../utils/format.js'
import { Card, ListRow, Select, SkeletonList, StatCard } from '../components/ui/Ui.jsx'

export default function Reports() {
  const [fin, setFin] = useState(null)
  const [appts, setAppts] = useState(null)
  const [dash, setDash] = useState(demoDashboard)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- range-driven report fetch
    setLoading(true)
    const from = new Date(Date.now() - Number(range) * 864e5).toISOString().slice(0, 10)
    const to = new Date().toISOString().slice(0, 10)
    Promise.all([
      api.get('/reports/financial', { params: { from, to } }).then(({ data }) => data).catch(() => ({ revenue: 486500, payments: 96, outstanding: 128400, daily: demoDashboard.revenue_7d, by_method: [{ method: 'cash', total: 210000 }, { method: 'card', total: 150000 }, { method: 'e_wallet', total: 90000 }, { method: 'bank_transfer', total: 36500 }] })),
      api.get('/reports/appointments', { params: { from, to } }).then(({ data }) => data).catch(() => ({ by_status: { completed: 58, scheduled: 22, cancelled: 6, no_show: 4 }, trend: [] })),
      api.get('/reports/dashboard').then(({ data }) => data).catch(() => demoDashboard),
    ]).then(([f, a, d]) => { setFin(f); setAppts(a); setDash(d) }).finally(() => setLoading(false))
  }, [range])

  if (loading || !fin) return <div className="page"><SkeletonList rows={8} /></div>

  return (
    <div className="page">
      <div className="page-head">
        <div><p className="eyebrow">Analytics</p><h1 className="page-title">Reports</h1><p className="page-sub">Financial, appointment, treatment & inventory analytics</p></div>
        <Select className="filter-select" value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option>
        </Select>
      </div>

      <div className="grid even3">
        <StatCard label="Revenue (period)" value={peso(fin.revenue)} delta={`${fin.payments} payments`} tone="green" />
        <StatCard label="Outstanding" value={peso(fin.outstanding)} delta="unpaid + partial" tone="amber" />
        <StatCard label="Completion rate" value={`${Math.round(((appts.by_status?.completed || 0) / Math.max(1, Object.values(appts.by_status || {}).reduce((s, v) => s + v, 0))) * 100)}%`} delta="completed appointments" tone="blue" />
      </div>

      <div className="grid two mt16">
        <Card title="Revenue trend" subtitle="Daily collections">
          <div className="chart-md">
            <ResponsiveContainer>
              <LineChart data={fin.daily} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11 }} tickFormatter={(d) => String(d).slice(5)} stroke="var(--text-muted)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" tickFormatter={(v) => `₱${v / 1000}k`} />
                <Tooltip formatter={(v) => peso(v)} />
                <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Payments by method" subtitle="Where money comes from">
          <div className="chart-md">
            <ResponsiveContainer>
              <BarChart data={fin.by_method} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" hide /><YAxis type="category" dataKey="method" tick={{ fontSize: 12 }} width={90} stroke="var(--text-muted)" />
                <Tooltip formatter={(v) => peso(v)} />
                <Bar dataKey="total" fill="var(--primary-light)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid even3 mt16">
        <Card title="Appointments by status" subtitle="In selected period">
          {Object.entries(appts.by_status || {}).map(([s, c]) => (
            <ListRow key={s} className="cap"><span>{s.replace(/_/g, ' ')}</span><b>{c}</b></ListRow>
          ))}
        </Card>
        <Card title="Top dentists" subtitle="By appointments">
          {(dash.dentists || []).map((d) => <ListRow key={d.id}><span><b>{d.name}</b><p className="sub">{d.appointments} appts</p></span><b>{peso(d.revenue)}</b></ListRow>)}
        </Card>
        <Card title="Inventory health" subtitle="Stock & expiry">
          <ListRow><span>Low stock items</span><b className="text-danger">{dash.alerts.low_stock}</b></ListRow>
          <ListRow><span>Expiring ≤ 60 days</span><b className="text-warning">{dash.alerts.expiring}</b></ListRow>
          <ListRow><span>Unpaid invoices</span><b>{dash.alerts.unpaid_invoices}</b></ListRow>
        </Card>
      </div>
    </div>
  )
}
