FROM node:22-alpine AS base
RUN apk add --no-cache dumb-init
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

FROM base AS build
COPY package.json package-lock.json* ./
COPY tsconfig*.json ./
COPY prisma.config.ts ./
COPY server/tsconfig.json ./server/
COPY vite.config.ts ./
COPY index.html ./
RUN npm ci
COPY . .
RUN npx prisma generate --schema=server/prisma/schema.prisma
RUN npx tsc -b && npx vite build

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server/src/generated ./server/src/generated
COPY server/prisma ./server/prisma
COPY server/src ./server/src
COPY prisma.config.ts ./
COPY package.json ./

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["dumb-init", "node", "--import", "tsx", "server/src/index.ts"]
