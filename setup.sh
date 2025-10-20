#!/bin/bash

echo "🚀 Setting up PayrollX-Solana locally..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v yarn &> /dev/null; then
        print_error "Yarn is not installed. Please install Yarn first."
        exit 1
    fi
    
    if ! command -v rustc &> /dev/null; then
        print_warning "Rust is not installed. Installing Rust..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source ~/.cargo/env
    fi
    
    print_status "Requirements check completed!"
}

# Create environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Copy .env.example files to .env
    for service in apps/*/; do
        if [ -f "${service}env.example" ]; then
            cp "${service}env.example" "${service}.env"
            print_status "Created .env for $(basename $service)"
        fi
    done
    
    # Create main .env file
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/payrollx_dev"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Service URLs
AUTH_SERVICE_URL="http://localhost:3001"
ORG_SERVICE_URL="http://localhost:3003"
EMPLOYEE_SERVICE_URL="http://localhost:3004"
WALLET_SERVICE_URL="http://localhost:3005"
PAYROLL_SERVICE_URL="http://localhost:3006"
TRANSACTION_SERVICE_URL="http://localhost:3007"
NOTIFICATION_SERVICE_URL="http://localhost:3008"
COMPLIANCE_SERVICE_URL="http://localhost:3009"

# MPC Server
MPC_SERVER_URL="http://localhost:8080"
MPC_JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Solana
SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_CLUSTER="devnet"

# Logging
LOG_LEVEL="info"
EOF
    
    print_status "Environment files created!"
}

# Install dependencies with fallback
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Try yarn install first
    if yarn install; then
        print_status "Dependencies installed successfully with Yarn!"
    else
        print_warning "Yarn install failed, trying npm install..."
        if npm install; then
            print_status "Dependencies installed successfully with npm!"
        else
            print_error "Failed to install dependencies with both Yarn and npm"
            print_warning "You may need to install dependencies manually for each service"
            return 1
        fi
    fi
}

# Build packages
build_packages() {
    print_status "Building packages..."
    
    # Build contracts package
    cd packages/contracts
    if yarn build; then
        print_status "Contracts package built successfully!"
    else
        print_warning "Failed to build contracts package"
    fi
    cd ../..
    
    # Build database package
    cd packages/database
    if yarn prisma:generate; then
        print_status "Database package generated successfully!"
    else
        print_warning "Failed to generate database package"
    fi
    cd ../..
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    print_warning "Please ensure PostgreSQL is running on localhost:5432"
    print_warning "Default credentials: postgres/password"
    print_warning "Database name: payrollx_dev"
    
    # Try to run database migrations
    cd packages/database
    if yarn prisma:migrate; then
        print_status "Database migrations completed!"
    else
        print_warning "Database migrations failed. Please check your PostgreSQL connection."
    fi
    cd ../..
}

# Main setup function
main() {
    echo "🎯 PayrollX-Solana Local Setup"
    echo "=============================="
    
    check_requirements
    setup_environment
    install_dependencies
    build_packages
    setup_database
    
    echo ""
    echo "🎉 Setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Ensure PostgreSQL is running on localhost:5432"
    echo "2. Run 'yarn dev' to start all services"
    echo "3. Access the frontend at http://localhost:3000"
    echo "4. Access API Gateway at http://localhost:3000/api"
    echo ""
    echo "Service URLs:"
    echo "- Auth Service: http://localhost:3001"
    echo "- Organization Service: http://localhost:3003"
    echo "- Employee Service: http://localhost:3004"
    echo "- Wallet Service: http://localhost:3005"
    echo "- Payroll Service: http://localhost:3006"
    echo "- Transaction Service: http://localhost:3007"
    echo "- Notification Service: http://localhost:3008"
    echo "- Compliance Service: http://localhost:3009"
    echo "- MPC Server: http://localhost:8080"
}

# Run main function
main

