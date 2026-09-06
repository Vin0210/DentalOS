FROM php:8.3-cli

# System deps + PHP extensions needed for pgsql / sqlite / mysql
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev libsqlite3-dev zip unzip git \
    && docker-php-ext-install pdo pdo_pgsql pdo_sqlite pdo_mysql bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Install deps first (better layer caching)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy app + finish install
COPY . .
RUN composer dump-autoload --optimize \
    && mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache database \
    && touch database/database.sqlite || true \
    && php artisan storage:link || true

EXPOSE 8000

RUN chmod +x docker-entrypoint.sh

# Render injects $PORT. Migrate on boot, auto-seed if empty, then serve.
CMD ["sh", "docker-entrypoint.sh"]
