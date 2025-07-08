# =============================================================================
# İ-EP.APP (Iqra Eğitim Portalı) Dockerfile
# =============================================================================
# Multi-stage build for optimized production image
# Supports Next.js 15 with Turbopack and TypeScript

# =============================================================================
# STAGE 1: Dependencies
# =============================================================================
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# =============================================================================
# STAGE 2: Builder
# =============================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Copy environment template for build-time variables
COPY .env.example .env.local

# Build arguments for environment variables
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_DOMAIN
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Set build environment variables
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_DOMAIN=${NEXT_PUBLIC_DOMAIN}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install all dependencies for build
RUN npm ci

# Build the application
RUN npm run build

# =============================================================================
# STAGE 3: Runtime
# =============================================================================
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built application from builder stage
COPY --from=builder /app/public ./public

# Create .next directory with proper permissions
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built Next.js application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application
CMD ["node", "server.js"]

# =============================================================================
# Docker Build Instructions:
# =============================================================================
# 
# Development build:
# docker build -t i-ep-app:dev .
# 
# Production build with environment variables:
# docker build \
#   --build-arg NEXT_PUBLIC_APP_NAME="İ-EP.APP" \
#   --build-arg NEXT_PUBLIC_APP_URL="https://i-ep.app" \
#   --build-arg NEXT_PUBLIC_DOMAIN="i-ep.app" \
#   --build-arg NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
#   --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
#   -t i-ep-app:latest .
# 
# Run container:
# docker run -p 3000:3000 \
#   -e SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
#   -e NEXTAUTH_SECRET="your-secret" \
#   -e UPSTASH_REDIS_URL="your-redis-url" \
#   -e UPSTASH_REDIS_TOKEN="your-redis-token" \
#   i-ep-app:latest
# 
# ============================================================================= 