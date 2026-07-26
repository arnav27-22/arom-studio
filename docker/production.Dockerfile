FROM node:22-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

COPY tsconfig*.json ./
COPY prisma.config.ts ./
COPY server/tsconfig.json ./server/
COPY vite.config.ts ./
COPY index.html ./
COPY . .

RUN npx prisma generate --schema=server/prisma/schema.prisma
RUN npx tsc -p server/tsconfig.json --noEmit
RUN npx vite build

FROM node:22-alpine AS runner
RUN apk add --no-cache dumb-init ca-certificates
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/src/generated ./server/src/generated
COPY server/prisma ./server/prisma
COPY server/src ./server/src
COPY prisma.config.ts ./
COPY package.json ./

ENV NODE_ENV=production
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

USER node
CMD ["dumb-init", "node", "--import", "tsx", "server/src/index.ts"]
