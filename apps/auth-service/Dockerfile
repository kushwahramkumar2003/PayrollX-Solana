# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools for native modules
RUN apk add --no-cache python3 make g++

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy all package.json files
COPY apps/auth-service/package.json ./apps/auth-service/
COPY packages/common/package.json ./packages/common/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/database/package.json ./packages/database/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/auth-service ./apps/auth-service
COPY packages/common ./packages/common
COPY packages/contracts ./packages/contracts
COPY packages/database ./packages/database
COPY packages/typescript-config ./packages/typescript-config

# Build packages first (typescript-config is just JSON files, no build needed)
RUN npm run build --workspace=@payrollx/common
RUN npm run build --workspace=@payrollx/contracts
RUN npm run build --workspace=@payrollx/database

# Build the application
RUN npm run build --workspace=@payrollx/auth-service

# Runtime stage
FROM node:20-alpine AS runtime

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy package files
COPY apps/auth-service/package.json ./apps/auth-service/
COPY packages/common/package.json ./packages/common/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/database/package.json ./packages/database/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install production dependencies for the @payrollx/auth-service workspace using root lockfile
RUN npm ci -w @payrollx/auth-service --omit=dev

# Copy built application
COPY --from=builder /app/apps/auth-service/dist ./apps/auth-service/dist

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Run the application
CMD ["npm", "run", "start", "--workspace=@payrollx/auth-service"]
