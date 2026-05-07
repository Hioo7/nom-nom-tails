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

# Install production deps + tsx/esbuild (for seed.ts at startup)
COPY package*.json ./
RUN npm ci --omit=dev && npm install --no-save tsx esbuild dotenv-cli

# Generated Prisma client (overwrite with builder's generated version)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Built app
COPY --from=builder /app/dist ./dist

# Source files (needed by tsx to resolve imports in seed.ts)
COPY --from=builder /app/src ./src

# Prisma schema, migrations, and seed
COPY --from=builder /app/prisma ./prisma

# Prisma config
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nodejs
EXPOSE 3000

ENTRYPOINT ["dumb-init", "--", "/bin/sh", "/entrypoint.sh"]
