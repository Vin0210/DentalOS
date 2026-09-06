import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, CalendarCheck, CircleDollarSign, Trophy, UserPlus, Users, Wallet, Clock, ArrowRight } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api from '../services/api.js'
import { demoDashboard } from '../services/mock.js'
import { fmtTime, peso } from '../utils/format.js'
import { Avatar, Badge, Card, SkeletonList, StatCard, StatusBadge } from '../components/ui/Ui.jsx'
import { AnimatedNumber, ProgressRing, staggerChild, staggerParent } from '../components/motion/Motion.jsx'
import DentalFact from '../components/fact/DentalFact.jsx'
import { Tooth } from '../components/odontogram/Odontogram.jsx'
import './Dashboard.css'
import '../components/fact/DentalFact.css'

const PIE_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#f43f5e', '#8b5cf6']

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/dashboard').then(({ data }) => setData(data)).catch(() => setData(demoDashboard)).finally(() => setLoading(false))
  }, [])

  const activity = useMemo(() => {
    const hours = Array.from({ length: 10 }, (_, i) => ({ h: `${8 + i}:00`, n: 0 }))
    ;(data?.upcoming || []).forEach((a) => {
      const h = parseInt(String(a.start_time).slice(0, 2), 10)
      const slot = hours.find((x) => x.h === `${h}:00`)
      if (slot) slot.n += 1
    })
    return hours
  }, [data])

  if (loading) return <div className="page"><SkeletonList rows={8} /></div>
  const k = data.kpis
  const pie = Object.entries(data.appointment_status || {}).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
  const completed = data.appointment_status?.completed || 0
  const totalAppts = Object.values(data.appointment_status || {}).reduce((s, v) => s + v, 0) || 1
  const champion = [...(data.dentists || [])].sort((a, b) => b.appointments - a.appointments)[0]
  const maxAct = Math.max(1, ...activity.map((a) => a.n))

  return (
    <div className="page dash">
      <div className="page-head">
        <div><p className="eyebrow">Clinic overview</p><h1 className="page-title">{greeting()}, Doctor</h1><p className="page-sub">Here&apos;s what&apos;s happening in your clinic today.</p></div>
        <div className="row">
          <Link className="btn secondary" to="/app/appointments">View calendar</Link>
          <Link className="btn primary" to="/app/patients">+ New patient</Link>
        </div>
      </div>

      <div className="grid kpi">
        <StatCard label="Appointments today" value={<AnimatedNumber value={k.appointments_today} />} delta={`${k.patients_today} patients`} icon={<CalendarCheck size={17} />} tone="teal" />
        <StatCard label="Revenue today" value={<AnimatedNumber value={k.revenue_today} format={(v) => peso(v)} />} delta="vs yesterday" icon={<CircleDollarSign size={17} />} tone="green" />
        <StatCard label="Outstanding" value={<AnimatedNumber value={k.outstanding} format={(v) => peso(v)} />} delta="collect this week" icon={<Wallet size={17} />} tone="amber" />
        <StatCard label="New patients" value={<AnimatedNumber value={k.new_patients_today} />} delta={`${k.total_patients} total`} icon={<UserPlus size={17} />} tone="blue" />
        <StatCard label="Low stock" value={<AnimatedNumber value={data.alerts.low_stock} />} delta="items to reorder" icon={<AlertTriangle size={17} />} tone="rose" />
        <StatCard label="Unpaid invoices" value={<AnimatedNumber value={data.alerts.unpaid_invoices} />} delta="need follow-up" icon={<Users size={17} />} tone="violet" />
      </div>

      <div className="grid two mt16">
        <Card title="Today's timeline" subtitle="Scheduled → in treatment → completed" action={<Link className="btn ghost sm" to="/app/appointments">Full calendar <ArrowRight size={14} /></Link>}>
          <motion.div className="appt-list" variants={staggerParent} initial="hidden" animate="show">
            {(data.upcoming || []).map((a) => (
              <motion.div key={a.id} variants={staggerChild}>
                <Link className="appt" to="/app/appointments">
                  <span className="appt-time"><Clock size={13} /> {fmtTime(a.start_time)}</span>
                  <Avatar name={a.patient?.first_name + ' ' + a.patient?.last_name} size={34} />
                  <span className="appt-main"><b>{a.patient?.first_name} {a.patient?.last_name}</b><i>{a.procedure?.name || 'Visit'} · {a.dentist?.user?.name}</i></span>
                  <StatusBadge value={a.status} />
                </Link>
              </motion.div>
            ))}
            {!data.upcoming?.length && <p className="muted small">No appointments scheduled.</p>}
          </motion.div>
          <div className="activity mt16">
            <p className="eyebrow">Dental activity · appointments per hour</p>
            <div className="activity-bars">
              {activity.map((s) => (
                <div key={s.h} className="abar" title={`${s.h}: ${s.n}`}>
                  <motion.i initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.05 }} style={{ height: `${Math.max(8, (s.n / maxAct) * 100)}%` }} />
                  <span>{s.h}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-16">
          <Card title="Today's progress" subtitle="Live completion tracking">
            <div className="rings">
              <ProgressRing value={completed} max={Math.max(totalAppts, completed)} label="Appointments" sub={`${completed}/${Math.max(totalAppts, completed)} done`} />
              <ProgressRing value={Math.min(8, completed + 2)} max={10} label="Treatments" sub="completed" tone="var(--success)" />
              <ProgressRing value={k.patients_today} max={Math.max(15, k.patients_today)} label="Check-ins" sub="patients" tone="var(--info)" />
            </div>
          </Card>
          <Card title="Revenue — last 7 days" subtitle="Payments collected per day">
            <div className="chart-sm">
              <ResponsiveContainer>
                <BarChart data={data.revenue_7d} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="d" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} stroke="var(--text-muted)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" tickFormatter={(v) => `₱${v / 1000}k`} />
                  <Tooltip formatter={(v) => peso(v)} labelStyle={{ color: 'var(--text-primary)' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }} />
                  <Bar dataKey="total" radius={[6, 6, 2, 2]} fill="var(--primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid even3 mt16">
        <Card title="Appointments by status" subtitle="Today's mix">
          <div className="chart-sm">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3}>
                  {pie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legend">{pie.map((p, i) => <span key={p.name}><i style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{p.name} · <b>{p.value}</b></span>)}</div>
        </Card>

        <div className="grid gap-16">
          {champion && (
            <div className="champion">
              <span className="champ-trophy"><Trophy size={18} /></span>
              <div><span className="champ-kicker">Today&apos;s champion</span><b>{champion.name}</b><span className="small muted">{champion.appointments} appointments · {peso(champion.revenue)}</span></div>
            </div>
          )}
          <Card title="Dentist performance" subtitle="This month">
            <div className="dent-list">
              {(data.dentists || []).map((d) => (
                <div key={d.id} className="dent">
                  <Avatar name={d.name} size={34} />
                  <span className="appt-main"><b>{d.name}</b><i>{d.specialization} · {d.appointments} appts</i></span>
                  <b className="dent-rev">{peso(d.revenue)}</b>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid gap-16">
          <Card title="Featured tooth" subtitle="Most treated this week — click to open chart" action={<Link className="btn ghost sm" to="/app/chart">Open <ArrowRight size={14} /></Link>}>
            <Link to="/app/chart" className="featured-tooth">
              <Tooth number="36" condition="filled" animateIn={false} small />
              <div><b>Tooth #36</b><p className="small muted">8 treatments · molar, lower left</p><Badge tone="info">filled</Badge></div>
            </Link>
          </Card>
          <DentalFact compact />
          <Card title="Needs attention" subtitle="Alerts across the clinic">
            <div className="alerts">
              <AlertRow tone="danger" title={`${data.alerts.low_stock} items low on stock`} sub="Reorder before procedures stall" link="/app/inventory" />
              <AlertRow tone="warning" title={`${data.alerts.unpaid_invoices} unpaid invoices`} sub={`Outstanding ${peso(k.outstanding)}`} link="/app/billing" />
              <AlertRow tone="info" title={`${data.alerts.expiring} items expiring soon`} sub="Within 60 days — use first" link="/app/inventory" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AlertRow({ tone, title, sub, link }) {
  return (
    <Link className="alert-row" to={link}>
      <Badge tone={tone}>•</Badge>
      <span><b>{title}</b><i>{sub}</i></span>
      <ArrowRight size={15} className="muted" />
    </Link>
  )
}
