# Etapa 1: Construcción con Bun
FROM oven/bun:1 AS builder

WORKDIR /app

# Copiar archivos de configuración y dependencias
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Instalar dependencias (bun genera su propio lockfile)
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

# Copiar TODO el node_modules generado (incluyendo enlaces monorepo)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Mover solo el codigo compilado
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/drizzle ./apps/api/drizzle
COPY --from=builder /app/apps/api/entrypoint.sh ./apps/api/

WORKDIR /app/apps/api
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

# Migraciones programáticas + arranque del servidor
ENTRYPOINT ["./entrypoint.sh"]
