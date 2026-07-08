FROM serversideup/php:8.2-fpm-nginx

COPY --chown=www-data:www-data . /var/www/html

WORKDIR /var/www/html

RUN composer install --no-interaction --optimize-autoloader --no-dev

EXPOSE 80