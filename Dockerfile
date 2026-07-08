FROM php:8.2-fpm

# Install system dependencies (including zip and git)
RUN apt-get clean && \
    apt-get update --fix-missing && \
    apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nginx \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy existing app files
COPY . .

# Fix Git ownership issue
RUN git config --global --add safe.directory /var/www/html

# Install PHP dependencies
RUN composer install --no-interaction --optimize-autoloader

# Create .env file from environment variables at runtime
RUN echo '#!/bin/sh\n\
set -e\n\
echo "=> Generating .env file from environment..."\n\
rm -f .env\n\
printenv | grep -E "^(APP_|DB_|PAWAPAY_|MTN_|MAKO_|RECAPTCHA_|COMPANY_|VITE_|REVERB_|MAIL_|AWS_|FILESYSTEM_|SESSION_|REDIS_|QUEUE_|CACHE_|BROADCAST_)" | sed "s/=(.*)/=\"\1\"/" > .env\n\
echo "=> Environment ready."\n\
exec "$@"' > /entrypoint.sh && chmod +x /entrypoint.sh

# Configure Nginx for Laravel
RUN echo 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /var/www/html/public;\n\
    index index.php index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.php?$query_string;\n\
    }\n\
    location ~ \.php$ {\n\
        fastcgi_pass 127.0.0.1:9000;\n\
        fastcgi_index index.php;\n\
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;\n\
        include fastcgi_params;\n\
    }\n\
    location ~ /\.ht {\n\
        deny all;\n\
    }\n\
}' > /etc/nginx/sites-available/default

# Expose port
EXPOSE 80

# Start PHP-FPM and Nginx
ENTRYPOINT ["/entrypoint.sh"]
CMD ["sh", "-c", "php-fpm -D && nginx -g 'daemon off;'"]