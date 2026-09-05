import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { EASE } from '../motion/Motion.jsx'
import DentalOSLogo from '../brand/DentalOSLogo.jsx'
import { GameFab } from '../game/CavityGame.jsx'
import { AppointmentModal } from '../appointments/BookingForm.jsx'
import {
  Bell, CalendarDays, LayoutDashboard, Users, Stethoscope, ClipboardList,
  Receipt, Boxes, BarChart3, Settings, Search, Menu, Moon, Sun, LogOut,
  ChevronDown, ChevronRight, Plus, UserRound, FlaskConical,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import api from '../../services/api.js'
import './Layout.css'

const NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true, roles: ['super_admin','clinic_admin','dentist','receptionist','accountant'] },
  { to: '/app/patients', label: 'Patients', icon: Users, roles: ['super_admin','clinic_admin','dentist','receptionist'] },
  { to: '/app/appointments', label: 'Appointments', icon: CalendarDays, roles: ['super_admin','clinic_admin','dentist','receptionist','patient'] },
  { to: '/app/chart', label: 'Dental Chart', icon: Stethoscope, roles: ['super_admin','clinic_admin','dentist'] },
  { to: '/app/treatments', label: 'Treatments', icon: ClipboardList, roles: ['super_admin','clinic_admin','dentist','patient'] },
  { to: '/app/billing', label: 'Billing', icon: Receipt, roles: ['super_admin','clinic_admin','accountant','receptionist','patient'] },
  { to: '/app/inventory', label: 'Inventory', icon: Boxes, roles: ['super_admin','clinic_admin','accountant'] },
  { to: '/app/reports', label: 'Reports', icon: BarChart3, roles: ['super_admin','clinic_admin','accountant','dentist'] },
  { to: '/app/team', label: 'Team', icon: UserRound, roles: ['super_admin','clinic_admin'] },
  { to: '/app/lab', label: 'Dentist Workspace', icon: FlaskConical, roles: ['super_admin','clinic_admin','dentist'] },
]

export default function AppLayout() {
  const { user, logout, demoMode } = useAuth()
  const { theme, toggleTheme, collapsed, toggleSidebar } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [showUser, setShowUser] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const loc = useLocation()

  const items = NAV.filter((n) => !user || n.roles.includes(user.role))
  const crumbs = loc.pathname.split('/').filter(Boolean).slice(1)
  const title = items.find((n) => loc.pathname === n.to || loc.pathname.startsWith(n.to + '/'))?.label
    ?? (crumbs[0] ? crumbs[0][0].toUpperCase() + crumbs[0].slice(1) : 'Dashboard')

  const doSearch = async (q) => {
    setQuery(q)
    if (q.length < 2) { setResults(null); return }
    try {
      const { data } = await api.get('/search', { params: { q } })
      setResults(data)
    } catch { setResults({ patients: [], appointments: [], invoices: [] }) }
  }

  return (
    <div className={`shell${collapsed ? ' collapsed' : ''}`}>
      <aside className={`sidebar${mobileOpen ? ' open' : ''}`} aria-label="Primary">
        <div className="brand">
          <DentalOSLogo size={26} showWordmark={!collapsed} collapseMotion />
          <button className="icon-btn collapse-btn" onClick={toggleSidebar} aria-label="Toggle sidebar"><ChevronRight size={15} /></button>
        </div>
        {demoMode && <div className="demo-pill">Demo mode</div>}
        <nav className="nav">
          {items.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
              <n.icon size={18} /><span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <NavLink to="/app/settings" className="nav-link"><Settings size={18} /><span>Settings</span></NavLink>
          <button className="nav-link" onClick={logout}><LogOut size={18} /><span>Sign out</span></button>
        </div>
      </aside>
      <div className="sidebar-scrim" onClick={() => setMobileOpen(false)} />

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={18} /></button>
          <div className="search-wrap">
            <Search size={15} />
            <input value={query} onChange={(e) => doSearch(e.target.value)} placeholder="Search patients, appointments, invoices…" aria-label="Global search" />
            {results && (
              <div className="search-pop" role="listbox">
                <p className="search-group">Patients</p>
                {(results.patients || []).map((p) => (
                  <Link key={p.id} to={`/app/patients/${p.id}`} onClick={() => setResults(null)}>{p.first_name} {p.last_name} <span className="muted">· {p.patient_no}</span></Link>
                ))}
                {!results.patients?.length && <span className="muted small">No patients</span>}
                <p className="search-group">Invoices</p>
                {(results.invoices || []).map((i) => (
                  <Link key={i.id} to="/app/billing" onClick={() => setResults(null)}>{i.invoice_no} <span className="muted">· {i.status}</span></Link>
                ))}
                {!results.invoices?.length && <span className="muted small">No invoices</span>}
              </div>
            )}
          </div>
          <div className="top-actions">
            <button className="btn primary sm" onClick={() => setQuickOpen(true)}><Plus size={15} /> Quick appointment</button>
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>
            <Link className="icon-btn" to="/app/notifications" aria-label="Notifications"><Bell size={17} /></Link>
            <div className="user-chip" onClick={() => setShowUser((s) => !s)}>
              <span className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{(user?.name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
              <span className="user-meta"><b>{user?.name}</b><i>{user?.role?.replace('_', ' ')}</i></span>
              <ChevronDown size={14} />
              {showUser && (
                <div className="user-menu">
                  <Link to="/app/settings">Clinic settings</Link>
                  <Link to="/portal">Patient portal view</Link>
                  <button onClick={logout}>Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content">
          <div className="crumbs"><Link to="/app">Home</Link><span>/</span><b>{title}</b></div>
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: EASE }}>
            <Outlet />
          </motion.div>
        </div>

        <nav className="bottom-nav" aria-label="Mobile">
          {items.slice(0, 5).map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => isActive ? 'active' : ''}>
              <n.icon size={20} /><span>{n.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </nav>
        <GameFab />
      </div>

      <AppointmentModal open={quickOpen} title="Quick appointment" onClose={() => setQuickOpen(false)} />
    </div>
  )
}
