# ─── Stage 1: Install production dependencies only ────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ─── Stage 2: Final lean image ────────────────────────────────────────────────
FROM node:20-alpine

# Create non-root user for security (never run as root in production)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only production node_modules from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY src ./src

# Create logs directory and set correct ownership
RUN mkdir -p logs && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Port — match what you set in .env / docker-compose
EXPOSE 5002

# Healthcheck — Docker will poll this to know if container is healthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5002/api/health || exit 1

CMD ["node", "src/server.js"]
