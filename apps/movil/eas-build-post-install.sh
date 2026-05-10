#!/bin/bash
# Script para eliminar copias duplicadas de React en node_modules
# Esto es necesario porque pnpm en monorepo crea múltiples copias
# de React que causan "Cannot read property 'useMemo' of null"

echo "==> Eliminando copias duplicadas de React..."

# Buscar y eliminar todas las copias anidadas de react/
find node_modules -path '*/node_modules/react' -not -path 'node_modules/react' -type d -exec rm -rf {} + 2>/dev/null || true

echo "==> Copias duplicadas de React eliminadas."
