# Etapa 1: Construcción con Bun
FROM oven/bun:1 AS builder

WORKDIR /app

# Copiar archivos de configuración y dependencias
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Instalar dependencias
RUN bun install

# Copiar el código fuente necesario
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/

# Construir la API
WORKDIR /app/apps/api
RUN bun run build

# Etapa 2: Producción ultraligera con Bun
FROM oven/bun:1-slim

WORKDIR /app

# Preservar estructura de workspaces para dependencias
COPY package.json bun.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Instalar dependencias en limpio
RUN bun install --no-frozen-lockfile --production

# Mover solo el codigo final
COPY packages/shared ./packages/shared
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/drizzle ./apps/api/drizzle
COPY --from=builder /app/apps/api/entrypoint.sh ./apps/api/

WORKDIR /app/apps/api
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

# Migraciones programáticas + arranque del servidor
ENTRYPOINT ["./entrypoint.sh"]
