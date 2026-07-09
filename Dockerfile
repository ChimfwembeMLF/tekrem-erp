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
FROM dunglas/frankenphp:1-php8.2 AS runner

# Install system dependencies (git, unzip, and curl are required)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Update install-php-extensions to the latest version
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
RUN if [ -f .env ]; then mv .env .env.bak; fi && \
    composer install --no-dev --optimize-autoloader --no-interaction --no-progress && \
    if [ -f .env.bak ]; then mv .env.bak .env; fi

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

# Run FrankenPHP
CMD ["frankenphp", "php-server", "-r", "public"]
