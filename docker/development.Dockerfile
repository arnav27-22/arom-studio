FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

COPY . .

EXPOSE 3001 5173

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["dumb-init", "npx", "concurrently", "--kill-others", "npx tsx watch server/src/index.ts", "npx vite"]
