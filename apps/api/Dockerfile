# Etapa 1: Construcción con Bun
FROM oven/bun:1 AS builder

WORKDIR /app

# Copiar archivos de configuración y dependencias
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Instalar dependencias
RUN bun install --frozen-lockfile

# Copiar el código fuente necesario
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/

# Construir la API
WORKDIR /app/apps/api
RUN bun run build

# Etapa 2: Producción ultraligera con Bun
FROM oven/bun:1-slim

WORKDIR /app

# Copiar lo necesario de la etapa de build
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/drizzle.config.ts ./
COPY --from=builder /app/node_modules ./node_modules

# Copiar carpeta de migraciones (generadas por drizzle-kit generate)
COPY --from=builder /app/apps/api/drizzle ./drizzle

# Copiar entrypoint que ejecuta migraciones antes de arrancar
COPY --from=builder /app/apps/api/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

# Migraciones automáticas + arranque del servidor
ENTRYPOINT ["./entrypoint.sh"]
