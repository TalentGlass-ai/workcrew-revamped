# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY . .

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built Next.js app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Use dumb-init to handle signals properly
ENTRYPOINT ["/sbin/dumb-init", "--"]

# Start Next.js server on the Cloud Run port
CMD ["sh", "-c", "node_modules/.bin/next start -p ${PORT:-8080}"]
