# ===============================
# 1. Build Vite (React + Inertia)
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

# 必要パッケージと拡張
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

# Composer コピー
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Laravel ソースをコピー
COPY . .

# Vite のビルド結果を public にコピー
COPY --from=node-build /app/public ./public

# Laravel 最適化
RUN composer install --no-dev --optimize-autoloader
RUN php artisan key:generate --force
RUN php artisan storage:link

# nginx 設定をコピー
COPY ./docker/nginx.conf /etc/nginx/nginx.conf

# 実行コマンド（php-fpm + nginx）
CMD service nginx start && php-fpm
