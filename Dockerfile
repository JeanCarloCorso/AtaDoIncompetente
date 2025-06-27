FROM php:8.2-apache

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    unzip \
    zip \
    git \
    && docker-php-ext-install pdo pdo_mysql

# Copiar e instalar o Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Definir diretório de trabalho
WORKDIR /var/www/html

# Copiar o código-fonte
COPY . .

# Instalar dependências PHP
RUN composer install

# Permitir que o Apache acesse os arquivos
RUN chown -R www-data:www-data /var/www/html
