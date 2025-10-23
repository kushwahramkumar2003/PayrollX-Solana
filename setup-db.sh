#!/bin/bash

# PayrollX Database Setup Script
# Sets up all database schemas for development

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Database URL
DATABASE_URL="postgresql://admin:adminpass@localhost:5432/payrollx_main"

print_status "Setting up PayrollX database schemas..."

# Check if database is accessible
if ! nc -z localhost 5432 2>/dev/null; then
    print_error "PostgreSQL is not running on localhost:5432"
    print_error "Please start the infrastructure services first:"
    print_error "  npm run dev:infra"
    exit 1
fi

# Navigate to database package
cd packages/database

# Push all schemas
for schema in prisma/*/schema.prisma; do
    schema_name=$(basename $(dirname "$schema"))
    print_status "Setting up $schema_name schema..."
    
    if DATABASE_URL="$DATABASE_URL" npx prisma db push --schema="$schema" --skip-generate >/dev/null 2>&1; then
        print_success "$schema_name schema is ready"
    else
        print_error "Failed to setup $schema_name schema"
        exit 1
    fi
done

# Generate all Prisma clients
print_status "Generating Prisma clients..."
npm run prisma:generate:all

print_success "Database setup complete!"
print_status "All schemas are ready and Prisma clients are generated"
