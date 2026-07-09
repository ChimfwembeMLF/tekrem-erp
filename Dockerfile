# --- Stage 1: Build Frontend Assets ---
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package configuration and lockfiles
COPY package.json yarn.lock* package-lock.json* ./

# Install frontend dependencies
RUN if [ -f yarn.lock ]; then yarn install; else npm install; fi

# Copy the rest of the application files and build
COPY . .
RUN if [ -f yarn.lock ]; then yarn run build; else npm run build; fi

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

# Configure custom PHP overrides inline (no external files needed)
RUN echo "upload_max_filesize = 100M" > $PHP_INI_DIR/conf.d/uploads.ini && \
    echo "post_max_size = 100M" >> $PHP_INI_DIR/conf.d/uploads.ini && \
    echo "memory_limit = 512M" >> $PHP_INI_DIR/conf.d/uploads.ini

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

# Expose port 80 (HTTP)
EXPOSE 80

# Health check: hit the standard Laravel 11/12 health check endpoint /up
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:80/up || exit 1

# Run FrankenPHP using its built-in production web server configuration
CMD ["frankenphp", "php-server", "-r", "public"]
