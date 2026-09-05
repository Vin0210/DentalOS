export const peso = (n) =>
  '₱' + Number(n ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const fmtDate = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const fmtTime = (t) => {
  if (!t) return '—'
  const [h, m] = String(t).split(':')
  const dt = new Date()
  dt.setHours(+h, +m)
  return dt.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })
}

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export const statusColor = (s = '') => {
  const m = {
    scheduled: 'info', confirmed: 'violet', checked_in: 'warning', in_progress: 'warning',
    completed: 'success', paid: 'success', active: 'success', accepted: 'success',
    cancelled: 'danger', declined: 'danger', unpaid: 'danger', no_show: 'muted',
    partial: 'warning', proposed: 'info', healthy: 'success', caries: 'danger',
    filled: 'info', crown: 'violet', root_canal: 'violet', missing: 'muted',
    extracted: 'muted', implant: 'success', fractured: 'danger', impacted: 'warning',
    low: 'muted', medium: 'info', high: 'warning', urgent: 'danger',
  }
  return m[String(s).toLowerCase()] || 'info'
}

export const TEETH_UPPER = ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28']
export const TEETH_LOWER = ['48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38']
export const TOOTH_CONDITIONS = [
  'healthy','caries','filled','missing','extracted','crown','root_canal','implant','fractured','impacted','veneer','bridge',
]
export const TOOTH_COLORS = {
  healthy: '#ffffff', caries: '#ef4444', filled: '#3b82f6', missing: '#e2e8f0',
  extracted: '#94a3b8', crown: '#f59e0b', root_canal: '#8b5cf6', implant: '#22c55e',
  fractured: '#f97316', impacted: '#eab308', veneer: '#14b8a6', bridge: '#6366f1',
}
export const SURFACES = ['mesial', 'distal', 'occlusal', 'buccal', 'lingual']
