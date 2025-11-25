# ===============================
# 1. Build Frontend (React + Vite)
# ===============================
FROM node:18 AS node-build

WORKDIR /app

# package.json をコピーして依存インストール
COPY package*.json ./
RUN npm install

# ソースコードコピー
COPY . .

# Vite ビルド
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

# Composer インストール
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Laravel ソースをコピー
COPY . .

# React ビルド済みファイルを public にコピー
COPY --from=node-build /app/public ./public

# Laravel install
RUN composer install --no-dev --optimize-autoloader

# Storage と cache ディレクトリ権限設定
RUN chmod -R 777 storage bootstrap/cache

# Storage symlink
RUN php artisan storage:link

# nginx 設定をコピー
COPY ./docker/nginx.conf /etc/nginx/nginx.conf

# nginx と php-fpm を同時起動
CMD service nginx start && php-fpm
