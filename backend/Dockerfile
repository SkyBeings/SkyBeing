# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup -S skybeing && adduser -S skybeing -G skybeing

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Ensure temp upload dir exists and is writable
RUN mkdir -p public/temp && chown -R skybeing:skybeing /app

USER skybeing

EXPOSE 8000

CMD ["node", "src/index.js"]
