#!/bin/bash

# Quick Fix Script for React 19 Dependency Conflicts
# Run this script to immediately resolve the current dependency issues

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🔧 Quick Fix: Resolving React 19 dependency conflicts..."

# Step 1: Install with legacy peer deps
print_status "Installing dependencies with --legacy-peer-deps..."
if npm install --legacy-peer-deps; then
    print_success "✅ Dependencies installed successfully!"
else
    print_error "❌ Installation failed. Trying alternative approach..."
    
    # Alternative: Install without peer deps check
    print_status "Trying installation without peer deps check..."
    if npm install --no-peer-deps; then
        print_success "✅ Dependencies installed with --no-peer-deps!"
    else
        print_error "❌ Installation failed completely. Please check the error messages."
        exit 1
    fi
fi

# Step 2: Build packages
print_status "Building shared packages..."
if npm run build:packages; then
    print_success "✅ Packages built successfully!"
else
    print_warning "⚠️ Package build had issues, but continuing..."
fi

# Step 3: Generate Prisma clients
print_status "Generating Prisma clients..."
if npm run db:generate; then
    print_success "✅ Prisma clients generated!"
else
    print_warning "⚠️ Prisma generation failed. Make sure PostgreSQL is running."
fi

print_success "🎉 Quick fix completed!"
echo ""
print_status "You can now run:"
echo "  npm run dev:start"
echo ""
print_warning "If you still encounter issues:"
echo "  - Run: ./migrate-to-react19.sh (for full migration)"
echo "  - Check: REACT_19_MIGRATION.md (for detailed guide)"
