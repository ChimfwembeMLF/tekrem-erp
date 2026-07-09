#!/bin/sh
set -e

# Optimize Laravel configuration and routes for production
echo "Optimizing Laravel configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force

# Optionally run seeders if the environment variable is set
if [ "$RUN_SEEDERS" = "true" ]; then
    echo "Running database seeders..."
    php artisan db:seed --force
fi

# Execute the CMD passed from the Dockerfile
exec "$@"
