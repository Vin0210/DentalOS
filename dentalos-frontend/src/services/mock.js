// Offline demo dataset — used automatically when the Laravel API is unreachable,
// so the product is always demonstrable. Shape mirrors the real API responses.
export const DEMO_USER = {
  id: 1, name: 'Maria Santos', email: 'admin@dentalos.ph', role: 'clinic_admin',
  branch: { id: 1, name: 'Smile Studio — Main' }, clinic: { id: 1, name: 'DentalOS Smile Studio', currency: '₱' },
}

const peso = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })

const first = ['Jose', 'Maria', 'Ana', 'Ramon', 'Liza', 'Miguel', 'Sofia', 'Rafael', 'Isabel', 'Paolo', 'Katrina', 'Daniel', 'Bianca', 'Enrico']
const last = ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Torres', 'Andrada', 'Castillo', 'Flores', 'Villanueva', 'Ramos', 'Aquino']

export const demoPatients = Array.from({ length: 48 }, (_, i) => ({
  id: i + 1,
  patient_no: 'PT-' + String(i + 1).padStart(6, '0'),
  first_name: first[i % first.length],
  last_name: last[(i * 5) % last.length],
  full_name: `${first[i % first.length]} ${last[(i * 5) % last.length]}`,
  age: 18 + ((i * 7) % 55),
  gender: i % 2 ? 'female' : 'male',
  phone: '+63917' + String(100000 + i * 791).slice(0, 7),
  email: `patient${i + 1}@example.com`,
  status: i % 11 === 0 ? 'inactive' : 'active',
  last_visit_at: new Date(Date.now() - (i % 30) * 864e5).toISOString(),
}))

export const demoAppointments = Array.from({ length: 14 }, (_, i) => ({
  id: i + 1,
  date: new Date().toISOString().slice(0, 10),
  start_time: `${String(8 + (i % 9)).padStart(2, '0')}:00`,
  end_time: `${String(8 + (i % 9)).padStart(2, '0')}:30`,
  status: ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'completed', 'cancelled'][i % 7],
  patient: demoPatients[i % demoPatients.length],
  dentist: { user: { name: ['Dr. Sofia Mendoza', 'Dr. Miguel Torres', 'Dr. Isabel Navarro'][i % 3] } },
  procedure: { name: ['Cleaning', 'Filling', 'Root Canal', 'Consultation', 'Extraction'][i % 5] },
}))

export const demoDashboard = {
  kpis: {
    appointments_today: 14, patients_today: 12, revenue_today: 38500,
    outstanding: 128400, new_patients_today: 3, total_patients: 1248,
  },
  appointment_status: { scheduled: 4, confirmed: 5, checked_in: 2, completed: 2, cancelled: 1 },
  upcoming: demoAppointments.slice(0, 6),
  revenue_7d: Array.from({ length: 7 }, (_, i) => ({
    d: new Date(Date.now() - (6 - i) * 864e5).toISOString().slice(0, 10),
    total: 18000 + ((i * 7331) % 30000),
  })),
  dentists: [
    { id: 1, name: 'Dr. Sofia Mendoza', specialization: 'Orthodontics', appointments: 32, revenue: 184500 },
    { id: 2, name: 'Dr. Miguel Torres', specialization: 'Endodontics', appointments: 28, revenue: 162000 },
    { id: 3, name: 'Dr. Isabel Navarro', specialization: 'General Dentistry', appointments: 41, revenue: 98500 },
  ],
  alerts: { low_stock: 3, unpaid_invoices: 17, expiring: 2 },
}

export const demoProcedures = [
  { id: 1, name: 'Consultation', code: 'CON-001', default_price: 500, duration_minutes: 20, category: { name: 'Preventive' } },
  { id: 2, name: 'Cleaning', code: 'CLN-001', default_price: 1000, duration_minutes: 40, category: { name: 'Preventive' } },
  { id: 3, name: 'Filling', code: 'FIL-001', default_price: 1500, duration_minutes: 40, category: { name: 'Restorative' } },
  { id: 4, name: 'Extraction', code: 'EXT-001', default_price: 2000, duration_minutes: 30, category: { name: 'Surgery' } },
  { id: 5, name: 'Root Canal', code: 'RCT-001', default_price: 8000, duration_minutes: 90, category: { name: 'Restorative' } },
  { id: 6, name: 'Crown', code: 'CRN-001', default_price: 12000, duration_minutes: 60, category: { name: 'Restorative' } },
  { id: 7, name: 'Whitening', code: 'WHT-001', default_price: 9000, duration_minutes: 60, category: { name: 'Cosmetic' } },
  { id: 8, name: 'Implant', code: 'IMP-001', default_price: 45000, duration_minutes: 120, category: { name: 'Surgery' } },
]

export const demoInvoices = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  invoice_no: 'INV-' + String(i + 1).padStart(6, '0'),
  patient: demoPatients[i % demoPatients.length],
  total: [8000, 1500, 12000, 500, 2000, 9000][i % 6],
  paid: i % 3 === 0 ? 0 : i % 3 === 1 ? [8000, 1500, 12000, 500, 2000, 9000][i % 6] : 3000,
  balance: 0,
  status: i % 3 === 0 ? 'unpaid' : i % 3 === 1 ? 'paid' : 'partial',
  created_at: new Date(Date.now() - i * 864e5).toISOString(),
})).map((inv) => ({ ...inv, balance: inv.total - inv.paid }))

export const demoInventory = [
  { id: 1, name: 'Latex Gloves (box)', sku: 'GLV-001', unit: 'box', quantity: 24, min_stock: 30, cost: 320, price: 416, is_low_stock: true, category: { name: 'Consumables' } },
  { id: 2, name: 'Mouth Mirror', sku: 'INS-010', unit: 'pcs', quantity: 45, min_stock: 20, cost: 150, price: 195, is_low_stock: false, category: { name: 'Instruments' } },
  { id: 3, name: 'Composite Resin Kit', sku: 'RES-020', unit: 'kit', quantity: 12, min_stock: 5, cost: 2500, price: 3250, is_low_stock: false, category: { name: 'Consumables' } },
  { id: 4, name: 'Lidocaine 2%', sku: 'ANE-005', unit: 'vial', quantity: 60, min_stock: 25, cost: 180, price: 234, is_low_stock: false, category: { name: 'Anesthetics' } },
  { id: 5, name: 'Dental Bibs', sku: 'CON-030', unit: 'pack', quantity: 8, min_stock: 15, cost: 450, price: 585, is_low_stock: true, category: { name: 'Consumables' } },
]

export const demoTimeline = [
  { date: new Date().toISOString(), type: 'treatment', title: 'Root Canal Treatment — Accepted', subtitle: 'Dr. Sofia Mendoza' },
  { date: new Date(Date.now() - 864e5).toISOString(), type: 'billing', title: 'Payment ₱3,000.00', subtitle: ' Cash · INV-000031' },
  { date: new Date(Date.now() - 2 * 864e5).toISOString(), type: 'prescription', title: 'Prescription created', subtitle: 'Amoxicillin 500mg' },
  { date: new Date(Date.now() - 5 * 864e5).toISOString(), type: 'note', title: 'Clinical note', subtitle: 'Irreversible pulpitis, tooth #16' },
  { date: new Date(Date.now() - 9 * 864e5).toISOString(), type: 'appointment', title: 'Appointment — Completed', subtitle: 'Cleaning' },
]

export { peso }
