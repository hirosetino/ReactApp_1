# ===============================
# 1. Build Frontend (React + Vite)
# ===============================
FROM node:18 AS node-build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ===============================
# 2. PHP + Laravel + nginx
# ===============================
FROM php:8.2-fpm

# --- 必須ライブラリ ---
RUN apt-get update && apt-get install -y \
    nginx \
    git \
    unzip \
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
# 3. PHP upload サイズ拡張
# -------------------------------
RUN echo "upload_max_filesize=100M" >> /usr/local/etc/php/php.ini \
    && echo "post_max_size=100M" >> /usr/local/etc/php/php.ini \
    && echo "memory_limit=256M" >> /usr/local/etc/php/php.ini \
    && echo "max_execution_time=300" >> /usr/local/etc/php/php.ini

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .
COPY --from=node-build /app/public/build ./public/build

RUN composer install --no-dev --optimize-autoloader
RUN chmod -R 777 storage bootstrap/cache
RUN php artisan storage:link

COPY ./docker/nginx.conf /etc/nginx/nginx.conf

CMD service nginx start && php-fpm
