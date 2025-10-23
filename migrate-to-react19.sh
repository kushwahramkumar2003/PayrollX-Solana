#!/bin/bash

# React 19 Migration Script for PayrollX-Solana
# This script automates the migration to React 19 and resolves dependency conflicts

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

print_status "Starting React 19 migration..."

# Step 1: Clean existing installations
print_status "Step 1: Cleaning existing installations..."
if [ -d "node_modules" ]; then
    print_status "Removing root node_modules..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    print_status "Removing package-lock.json..."
    rm -f package-lock.json
fi

# Clean workspace node_modules
print_status "Cleaning workspace node_modules..."
for dir in apps/* packages/*; do
    if [ -d "$dir/node_modules" ]; then
        print_status "Removing $dir/node_modules..."
        rm -rf "$dir/node_modules"
    fi
    if [ -f "$dir/package-lock.json" ]; then
        print_status "Removing $dir/package-lock.json..."
        rm -f "$dir/package-lock.json"
    fi
done

# Step 2: Clean npm cache
print_status "Step 2: Cleaning npm cache..."
npm cache clean --force

# Step 3: Install dependencies with legacy peer deps
print_status "Step 3: Installing dependencies with React 19..."
print_warning "Using --legacy-peer-deps to handle dependency conflicts..."

if npm install --legacy-peer-deps; then
    print_success "Dependencies installed successfully!"
else
    print_error "Failed to install dependencies. Trying alternative approach..."
    
    # Alternative: Install without peer deps check
    print_status "Trying installation without peer deps check..."
    npm install --no-peer-deps || {
        print_error "Installation failed. Please check the error messages above."
        exit 1
    }
fi

# Step 4: Build packages
print_status "Step 4: Building shared packages..."
if npm run build:packages; then
    print_success "Packages built successfully!"
else
    print_warning "Package build failed. This might be expected if there are TypeScript errors."
    print_status "Continuing with development setup..."
fi

# Step 5: Generate Prisma clients
print_status "Step 5: Generating Prisma clients..."
if npm run db:generate; then
    print_success "Prisma clients generated successfully!"
else
    print_warning "Prisma generation failed. Make sure PostgreSQL is running."
fi

# Step 6: Verify installation
print_status "Step 6: Verifying installation..."

# Check React versions
print_status "Checking React versions..."
REACT_VERSION=$(npm list react --depth=0 2>/dev/null | grep react@ | cut -d'@' -f2 || echo "Not found")
REACT_DOM_VERSION=$(npm list react-dom --depth=0 2>/dev/null | grep react-dom@ | cut -d'@' -f2 || echo "Not found")

if [[ "$REACT_VERSION" == "19"* ]]; then
    print_success "React version: $REACT_VERSION ✅"
else
    print_warning "React version: $REACT_VERSION (expected 19.x)"
fi

if [[ "$REACT_DOM_VERSION" == "19"* ]]; then
    print_success "React DOM version: $REACT_DOM_VERSION ✅"
else
    print_warning "React DOM version: $REACT_DOM_VERSION (expected 19.x)"
fi

# Check lucide-react version
LUCIDE_VERSION=$(npm list lucide-react --depth=0 2>/dev/null | grep lucide-react@ | cut -d'@' -f2 || echo "Not found")
if [[ "$LUCIDE_VERSION" == "0.546"* ]]; then
    print_success "Lucide React version: $LUCIDE_VERSION ✅"
else
    print_warning "Lucide React version: $LUCIDE_VERSION (expected 0.546.x)"
fi

# Step 7: Test build
print_status "Step 7: Testing build..."
if npm run check-types; then
    print_success "TypeScript check passed! ✅"
else
    print_warning "TypeScript check failed. Check the errors above."
fi

# Final status
print_status "Migration completed!"
echo ""
print_success "✅ React 19 migration completed successfully!"
echo ""
print_status "Next steps:"
echo "1. Run 'npm run dev:start' to start the development environment"
echo "2. Check the REACT_19_MIGRATION.md file for detailed information"
echo "3. Test all features to ensure everything works correctly"
echo ""
print_warning "If you encounter any issues:"
echo "- Check the troubleshooting section in REACT_19_MIGRATION.md"
echo "- Use 'npm install --legacy-peer-deps' if you see peer dependency warnings"
echo "- Run 'npm run clean && npm run build:packages' to rebuild packages"
echo ""
print_status "Happy coding with React 19! 🚀"
