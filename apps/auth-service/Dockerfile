# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy all package.json files
COPY apps/auth-service/package.json ./apps/auth-service/
COPY packages/database/package.json ./packages/database/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/auth-service ./apps/auth-service
COPY packages ./packages

# Generate Prisma clients
RUN cd packages/database && npm run prisma:generate:auth

# Build the application
RUN npm run build --workspace=@payrollx/auth-service

# Runtime stage
FROM node:20-alpine AS runtime

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./
COPY apps/auth-service/package.json ./apps/auth-service/
COPY packages/database/package.json ./packages/database/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install production dependencies only
RUN npm ci --only=production

# Copy built application and necessary files
COPY --from=builder /app/apps/auth-service/dist ./apps/auth-service/dist
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3001

# Run the application
CMD ["node", "apps/auth-service/dist/main.js"]

