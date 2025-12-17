# ===============================
# 1. Build Frontend (React + Vite)
# ===============================
FROM node:24 AS node-build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ===============================
# 2. PHP + Laravel + nginx + cron + supervisor
# ===============================
FROM php:8.4-fpm

# --- 必須ライブラリ ---
RUN apt-get update && apt-get install -y \
    nginx \
    git \
    unzip \
    cron \
    supervisor \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libwebp-dev \
    libonig-dev \
    libxml2-dev \
    libheif-dev \
    imagemagick \
    libmagickwand-dev \
    libmagickcore-dev \
    && docker-php-ext-install pdo_mysql zip

# --- Imagick PHP拡張 ---
RUN pecl install imagick \
    && docker-php-ext-enable imagick

# -------------------------------
# PHP 設定
# -------------------------------
RUN echo "upload_max_filesize=100M" >> /usr/local/etc/php/php.ini \
    && echo "post_max_size=100M" >> /usr/local/etc/php/php.ini \
    && echo "memory_limit=256M" >> /usr/local/etc/php/php.ini \
    && echo "max_execution_time=300" >> /usr/local/etc/php/php.ini

# --- composer ---
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# --- Laravel ---
COPY . .
COPY --from=node-build /app/public/build ./public/build

RUN composer install --no-dev --optimize-autoloader \
    && chmod -R 777 storage bootstrap/cache \
    && php artisan storage:link

# --- nginx ---
COPY ./docker/nginx.conf /etc/nginx/nginx.conf

# --- cron ---
COPY ./docker/laravel-cron /etc/cron.d/laravel-cron
RUN chmod 0644 /etc/cron.d/laravel-cron \
    && crontab /etc/cron.d/laravel-cron

# --- supervisor ---
COPY ./docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# -------------------------------
# 起動
# -------------------------------
CMD service cron start \
    && service nginx start \
    && supervisord -n
