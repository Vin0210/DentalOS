import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import AppLayout from './components/layout/Layout.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Patients from './pages/Patients.jsx'
import PatientProfile from './pages/PatientProfile.jsx'
import Appointments from './pages/Appointments.jsx'
import DentalChart from './pages/DentalChart.jsx'
import Treatments from './pages/Treatments.jsx'
import Billing from './pages/Billing.jsx'
import Inventory from './pages/Inventory.jsx'
import Reports from './pages/Reports.jsx'
import Lab from './pages/Lab.jsx'
import Portal from './pages/Portal.jsx'
import { Audit, Notifications, Settings, Team } from './pages/Admin.jsx'
import './styles/tokens.css'
import './styles/base.css'
import './components/motion/Motion.css'
import './components/ui/Ui.css'
import './components/layout/Layout.css'
import './components/odontogram/Odontogram.css'
import './components/game/CavityGame.css'
import './pages/Auth.css'
import './pages/Landing.css'
import './pages/Dashboard.css'
import './pages/Patients.css'
import './pages/Appointments.css'
import './pages/Portal.css'

function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page"><div className="skeleton" style={{ height: 200 }} /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === 'patient' ? '/portal' : '/app'} replace />
  return children
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/portal" element={<RequireAuth roles={['patient', 'super_admin', 'clinic_admin', 'dentist', 'receptionist', 'accountant']}><Portal /></RequireAuth>} />
            <Route path="/app" element={<RequireAuth><AppLayout /></RequireAuth>}>
              <Route index element={<Dashboard />} />
              <Route path="patients" element={<RequireAuth roles={['super_admin', 'clinic_admin', 'dentist', 'receptionist']}><Patients /></RequireAuth>} />
              <Route path="patients/:id" element={<PatientProfile />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="chart" element={<RequireAuth roles={['super_admin', 'clinic_admin', 'dentist']}><DentalChart /></RequireAuth>} />
              <Route path="treatments" element={<Treatments />} />
              <Route path="billing" element={<Billing />} />
              <Route path="inventory" element={<RequireAuth roles={['super_admin', 'clinic_admin', 'accountant']}><Inventory /></RequireAuth>} />
              <Route path="reports" element={<RequireAuth roles={['super_admin', 'clinic_admin', 'accountant', 'dentist']}><Reports /></RequireAuth>} />
              <Route path="team" element={<RequireAuth roles={['super_admin', 'clinic_admin']}><Team /></RequireAuth>} />
              <Route path="lab" element={<RequireAuth roles={['super_admin', 'clinic_admin', 'dentist']}><Lab /></RequireAuth>} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="audit" element={<RequireAuth roles={['super_admin', 'clinic_admin']}><Audit /></RequireAuth>} />
              <Route path="settings" element={<RequireAuth roles={['super_admin', 'clinic_admin']}><Settings /></RequireAuth>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
    </MotionConfig>
  )
}
