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

RUN apt-get update && apt-get install -y \
    nginx \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    && docker-php-ext-install pdo_mysql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Laravel ソースをコピー
COPY . .

# ❗ buildフォルダだけコピー（重要）
COPY --from=node-build /app/public/build ./public/build

# （必要であれば）Raw React ファイルもコピー
COPY --from=node-build /app/resources ./resources

RUN composer install --no-dev --optimize-autoloader

RUN chmod -R 777 storage bootstrap/cache

RUN php artisan storage:link

COPY ./docker/nginx.conf /etc/nginx/nginx.conf

CMD service nginx start && php-fpm
