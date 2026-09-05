<div align="center">

# DentalOS

**The operating system for modern dental clinics.**

DentalOS unifies patients, appointments, clinical records, billing, inventory and reporting in one calm, fast workspace your whole team will actually enjoy using.

Built with **React + Vite** (frontend) and **Laravel + Sanctum** (API).

</div>

---

## ✨ Features

- **Patient management** — rich profiles, medical histories, files and a chronological timeline for every patient
- **Smart appointments** — day / week / month views with dentist & room conflict prevention
- **Interactive dental chart (Odontogram)** — FDI numbering, per-tooth conditions and surface-level markings, adult & pediatric dentition
- **Treatment planning** — propose, price and track plans from diagnosis through completion
- **Billing & payments** — invoices, partial payments, refunds and outstanding balances in pesos
- **Inventory & suppliers** — stock levels, low-stock & expiry alerts, purchase orders that update stock
- **Laboratory workspace** — imaging, case tracking and dentist-facing tools
- **Patient portal** — appointment requests, invoices, prescriptions and notifications
- **Reports, audit logs & roles** — 5 user roles, role-based access, full audit trail
- **Interactive landing page** — anatomy hotspots, clickable odontogram preview, scroll-driven journey, and a hidden easter egg 🦷

---

## 🧰 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, React Router 7, Framer Motion, Lucide, Recharts |
| Backend | Laravel 13, Laravel Sanctum (token auth) |
| Database | MySQL (configurable via `.env`) |
| Language | PHP ≥ 8.3 |

---

## 🚀 Getting Started

> **Prerequisites:** Node.js ≥ 20, PHP ≥ 8.3, Composer, and a MySQL database (or whatever DB you configure in `.env`).

### 1. Clone & install dependencies

```bash
git clone https://github.com/Vin0210/DentalOS.git
cd DentalOS
```

### 2. Set up the backend (API on `:8000`)

```bash
cd dentalos-backend

# Install PHP dependencies
composer install

# Create .env from the template and generate an app key
cp .env.example .env
php artisan key:generate

# Configure your database in .env (DB_DATABASE, DB_USERNAME, DB_PASSWORD), then:
php artisan migrate --seed

# Start the API server
php artisan serve
```

### 3. Set up the frontend (web app on `:5173`)

```bash
cd ../dentalos-frontend

npm install
npm run dev
```

Then open **http://localhost:5173**.

> The Vite dev server proxies `/api` → `http://localhost:8000`, so keep both running.
> If your API is on a different port, update the proxy in `dentalos-frontend/vite.config.js`.

---

## 🔐 Demo Accounts

The seeders create demo accounts — one for every role (all use the password `password`):

| Role | Email |
|---|---|
| Admin | `admin@dentalos.ph` |
| Dentist | `dentist@dentalos.ph` |
| Receptionist | `reception@dentalos.ph` |
| Accounting | `accounting@dentalos.ph` |
| Patient | `patient@dentalos.ph` |

The login screen also has one-click demo chips for each role.

---

## 🧪 Common Commands

```bash
# Frontend
cd dentalos-frontend
npm run dev       # dev server
npm run build     # production build
npm run lint      # eslint

# Backend
cd dentalos-backend
php artisan serve              # run API
php artisan migrate --seed     # fresh DB + demo data
php artisan test               # run tests
```

---

## 📁 Project Structure

```
DentalOS/
├── dentalos-frontend/          # React + Vite single-page app
│   └── src/
│       ├── pages/              # Landing, Login, Dashboard, Patients, Billing, ...
│       ├── components/         # UI, layout, odontogram, hero, branding, ...
│       ├── context/            # Auth & theme providers
│       ├── services/           # API client + mock data
│       └── styles/             # Design tokens & base styles
│
└── dentalos-backend/           # Laravel REST API
    ├── app/                    # Models, controllers, policies
    ├── routes/api.php          # API routes (Sanctum-protected)
    ├── database/               # Migrations + seeders (demo data)
    └── tests/                  # Feature & unit tests
```

---

## 🔒 Security

- All API access is Sanctum-token authenticated with **role checks on every endpoint**
- Passwords are hashed with Laravel's default `bcrypt`
- A full **audit log** records sensitive actions
- The real `.env` is git-ignored — never commit it. Cloning repos copy `.env.example` → `.env` instead

---

## 📄 License

Open-source project for demonstration purposes. Built on the [MIT](https://opensource.org/licenses/MIT) Laravel skeleton.