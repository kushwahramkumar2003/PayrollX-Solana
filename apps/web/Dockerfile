# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy all package.json files
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/web ./apps/web
COPY packages/ui ./packages/ui

# Build the application
RUN npm run build --workspace=web

# Runtime stage
FROM node:20-alpine AS runtime

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/

# Install production dependencies only
RUN npm ci --only=production --workspace=web

# Copy built application
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.js ./apps/web/
COPY --from=builder /app/apps/web/package.json ./apps/web/

# Expose port
EXPOSE 3000

# Run the application
CMD ["npm", "run", "start", "--workspace=web"]
