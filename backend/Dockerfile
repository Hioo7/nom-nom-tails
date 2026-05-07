FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
RUN apk add --no-cache dumb-init
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Production node_modules
COPY --from=deps /app/node_modules ./node_modules

# Prisma CLI (needed for migrate deploy at startup)
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# tsx + esbuild (needed for running seed.ts at startup)
COPY --from=builder /app/node_modules/.bin/tsx ./node_modules/.bin/tsx
COPY --from=builder /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder /app/node_modules/esbuild ./node_modules/esbuild
COPY --from=builder /app/node_modules/@esbuild ./node_modules/@esbuild

# Generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Built app
COPY --from=builder /app/dist ./dist

# Source files (needed for tsx to resolve imports when running seed.ts)
COPY --from=builder /app/src ./src

# Prisma schema and migrations (needed for migrate deploy)
COPY --from=builder /app/prisma ./prisma

# Prisma config (needed for datasource URL resolution at runtime)
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nodejs
EXPOSE 3000

ENTRYPOINT ["dumb-init", "--", "/bin/sh", "/entrypoint.sh"]
