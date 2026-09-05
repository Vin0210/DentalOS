import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { ArrowRight, Check, Eye, EyeOff, Info, Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { friendlyError } from '../services/api.js'
import { EASE } from '../components/motion/Motion.jsx'
import DentalOSLogo from '../components/brand/DentalOSLogo.jsx'
import DentalVisual from '../components/login/DentalVisual.jsx'
import './Auth.css'

const DEMO_ACCOUNTS = [['admin', 'Admin'], ['dentist', 'Dentist'], ['reception', 'Reception'], ['accounting', 'Accounting'], ['patient', 'Patient']]

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z" />
    </svg>
  )
}

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ email: 'admin@dentalos.ph', password: 'password' })
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const shake = useAnimationControls()

  const submit = async (e) => {
    e.preventDefault()
    if (loading || success) return
    setLoading(true); setError(''); setNote('')
    try {
      const user = await login(form.email, form.password)
      setSuccess(true)
      setTimeout(() => nav(user.role === 'patient' ? '/portal' : '/app', { replace: true }), 800)
    } catch (err) {
      setError(friendlyError(err, 'Invalid email or password.'))
      shake.start({ x: [0, -10, 10, -6, 6, 0] }, { duration: 0.45 })
    } finally { setLoading(false) }
  }

  const quick = (role) => {
    setForm({ email: `${role}@dentalos.ph`, password: 'password' })
    setError(''); setNote('')
  }

  return (
    <div className="auth-page">
      <main className="auth-visual" aria-label="DentalOS product highlights">
        <DentalVisual />
      </main>

      <motion.section className="auth-form-side" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25, ease: EASE }}>
        <div className="auth-form-inner">
          <div className="auth-brand"><DentalOSLogo size={30} animated /></div>
          <h1>Welcome back</h1>
          <p className="muted">Sign in to continue managing your dental practice.</p>

          <form className="auth-form" onSubmit={submit}>
            <motion.div className="auth-fields" animate={shake}>
              <label className="field">
                <span>Email address</span>
                <div className="auth-input">
                  <Mail size={16} />
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" placeholder="you@clinic.ph" />
                </div>
              </label>

              <label className="field">
                <span>Password</span>
                <div className="auth-input">
                  <Lock size={16} />
                  <input type={show ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" placeholder="••••••••" />
                  <button type="button" className="auth-eye" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span key={show ? 'off' : 'on'} style={{ display: 'inline-flex' }} initial={{ opacity: 0, rotate: -60 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 60 }} transition={{ duration: 0.18 }}>
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                </div>
              </label>

              <div className="auth-row">
                <label className="auth-remember">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span className="auth-checkbox" aria-hidden><Check size={12} strokeWidth={3.5} /></span>
                  Remember me
                </label>
                <button type="button" className="auth-link" onClick={() => setNote('Password resets are handled by your clinic administrator in this demo.')}>Forgot password?</button>
              </div>

              {error && <div className="auth-error" role="alert">{error}</div>}
              <AnimatePresence>
                {note && (
                  <motion.div className="auth-note" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status">
                    <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} /> {note}
                  </motion.div>
                )}
              </AnimatePresence>

              <button className={`btn primary lg auth-submit${success ? ' success' : ''}`} disabled={loading || success} type="submit">
                {loading
                  ? <><span className="auth-spinner" aria-hidden /> Signing in…</>
                  : success
                    ? <><Check size={17} /> Success — opening your workspace</>
                    : <>Sign in <ArrowRight size={16} /></>}
              </button>
            </motion.div>

            <div className="auth-divider">or continue with</div>
            <button type="button" className="btn secondary lg auth-google" onClick={() => setNote("Google sign-in isn't connected in the demo — use a demo account below.")}>
              <GoogleIcon /> Continue with Google
            </button>

            <div className="demo-accounts">
              <p className="small muted">One-click demo accounts · password <code>password</code></p>
              <div className="auth-chips">
                {DEMO_ACCOUNTS.map(([role, label]) => <button key={role} type="button" className="chip" onClick={() => quick(role)}>{label}</button>)}
              </div>
            </div>
            <p className="small muted auth-back"><Link to="/">← Back to site</Link></p>
          </form>
        </div>
      </motion.section>
    </div>
  )
}
