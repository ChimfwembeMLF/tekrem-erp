FROM serversideup/php:8.2-fpm-nginx

# Install GD extension (required for phpoffice/phpspreadsheet)
USER root
RUN apt-get update && apt-get install -y \
    libfreetype-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
USER www-data

# Copy application
COPY --chown=www-data:www-data . /var/www/html

# Set working directory
WORKDIR /var/www/html

# Install PHP dependencies
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Create .env file from environment variables at runtime
RUN echo '#!/bin/sh\n\
set -e\n\
echo "=> Generating .env file from environment..."\n\
rm -f .env\n\
printenv | grep -E "^(APP_|DB_|PAWAPAY_|MTN_|MAKO_|RECAPTCHA_|COMPANY_|VITE_|REVERB_|MAIL_|AWS_|FILESYSTEM_|SESSION_|REDIS_|QUEUE_|CACHE_|BROADCAST_)" | sed "s/=(.*)/=\"\1\"/" > .env\n\
echo "=> Environment ready."\n\
exec "$@"' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]