#!/bin/sh
set -e

php artisan config:clear

# Always migrate (safe)
php artisan migrate --force

# Seed ONLY if users table is empty (safe to run on every boot / redeploy)
EMPTY=$(php artisan tinker --execute="echo App\\Models\\User::count();" 2>/dev/null | tail -n 1 | tr -d '[:space:]')
if [ "$EMPTY" = "0" ] || [ -z "$EMPTY" ]; then
  echo "Users table empty - seeding demo data..."
  php artisan db:seed --force
else
  echo "Users table has $EMPTY users - skipping seed."
fi

php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
