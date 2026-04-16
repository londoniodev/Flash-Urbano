#!/bin/sh
set -e

echo "🔄 Ejecutando migraciones de base de datos..."
bunx drizzle-kit migrate

echo "🚀 Iniciando Flash Urbano API..."
exec bun dist/main.js
