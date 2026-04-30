#!/bin/sh
set -e

echo "Aguardando o PostgreSQL em ${DATABASE_HOST}:${DATABASE_PORT}..."
until pg_isready -h "${DATABASE_HOST}" -p "${DATABASE_PORT}" -U "${DATABASE_USER}" -q; do
  sleep 2
done
echo "PostgreSQL disponível."

echo "Executando migrations..."
npm run migration:run

echo "Populando o banco com dados iniciais..."
npm run seed

echo "Iniciando a API..."
exec node dist/main.js
