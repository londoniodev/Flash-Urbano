#!/bin/sh
set -e

echo "🔄 Ejecutando migraciones de base de datos..."
bun dist/database/migrate.js

echo "🚀 Iniciando Flash Urbano API..."
exec bun dist/main.js
