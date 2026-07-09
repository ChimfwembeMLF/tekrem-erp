# --- Stage 1: Build Frontend Assets ---
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package configuration and lockfile
COPY package.json pnpm-lock.yaml ./

# Install frontend dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application files and build
COPY . .
RUN pnpm build

# --- Stage 2: Final Runtime Environment ---
FROM dunglas/frankenphp:1-php8.4 AS runner

# Install system dependencies (git, unzip, and curl are required)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Update install-php-extensions to the latest version to avoid PECL errors for PHP 8.4
ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

# Install PHP extensions
RUN install-php-extensions \
    bcmath \
    gd \
    intl \
    opcache \
    pdo_mysql \
    pdo_pgsql \
    pcntl \
    zip \
    redis \
    memcached

# Use the production php.ini
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Copy custom PHP configuration overrides
COPY docker/uploads.ini $PHP_INI_DIR/conf.d/uploads.ini

# Set working directory
WORKDIR /app

# Copy Composer from the official Docker image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . .

# Copy compiled frontend assets from Stage 1
COPY --from=frontend-builder /app/public/build ./public/build

# Install PHP dependencies
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Ensure Laravel storage and cache directories exist and have proper permissions
RUN mkdir -p \
    storage/app/public \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache \
    storage/logs \
    bootstrap/cache \
    && chown -R www-data:www-data /app \
    && chmod -R 775 storage bootstrap/cache

# Copy custom Caddyfile and entrypoint script
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port 80 (HTTP) for Traefik proxy
EXPOSE 80

# Health check: hit the /health endpoint every 30 seconds
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Run entrypoint script
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
