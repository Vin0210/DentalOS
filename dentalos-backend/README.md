# DentalOS — API (Laravel)

The Laravel REST API powering DentalOS. Provides Sanctum-token authentication and role-checked endpoints for patients, appointments, odontogram charts, treatments, billing, inventory, reports and more.

## Requirements

- PHP ≥ 8.3
- Composer
- A database (MySQL recommended)

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

The API runs at `http://localhost:8000` by default. The frontend's Vite dev server (`:5173`) proxies `/api` requests here.

## Demo accounts

Seeders create one account per role, all with password `password` — see the [root README](../README.md#demo-accounts) for the email addresses.

## Testing

```bash
php artisan test
```
