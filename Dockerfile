# Stage 1: Build the Node.js (React/Vite) assets
FROM node:22-alpine AS node_builder
WORKDIR /app
# Copy package files and install dependencies
COPY package.json yarn.lock* package-lock.json* ./
# Use yarn if yarn.lock exists, otherwise npm
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm ci; fi
# Copy the rest of the application
COPY . .
# Build the Vite assets
RUN if [ -f yarn.lock ]; then yarn run build; else npm run build; fi

# Stage 2: Production PHP server with Nginx
# The serversideup image is highly optimized for Laravel production
FROM serversideup/php:8.2-fpm-nginx

# Switch to root to install necessary PHP extensions
USER root
# serversideup images come with `install-php-extensions` script
RUN install-php-extensions gd zip pdo_mysql pcntl redis

# Switch back to the unprivileged www-data user
USER www-data

# Copy the entire Laravel application to the web root
COPY --chown=www-data:www-data . /var/www/html

# Copy the built React assets from the node_builder stage
COPY --chown=www-data:www-data --from=node_builder /app/public/build /var/www/html/public/build

# Install PHP dependencies
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# Cache Laravel configurations for production performance
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Expose the default port used by serversideup Nginx
EXPOSE 8080

# The base image automatically starts supervisord, which manages Nginx and PHP-FPM
