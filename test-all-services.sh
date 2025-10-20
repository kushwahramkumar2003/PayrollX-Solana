#!/bin/bash

# PayrollX-Solana Service Testing Script
# This script tests all services in the PayrollX-Solana monorepo

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service configurations
declare -A SERVICES=(
    ["auth-service"]="3001"
    ["org-service"]="3002"
    ["employee-service"]="3003"
    ["wallet-service"]="3004"
    ["payroll-service"]="3005"
    ["transaction-service"]="3006"
    ["notification-service"]="3007"
    ["compliance-service"]="3008"
    ["api-gateway"]="3000"
)

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✓${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}✗${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠${NC} $message"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ${NC} $message"
            ;;
    esac
}

# Function to check if a service is running
check_service_running() {
    local service_name=$1
    local port=$2
    
    if curl -s "http://localhost:$port/api/health" > /dev/null 2>&1; then
        print_status "SUCCESS" "$service_name is running on port $port"
        return 0
    else
        print_status "ERROR" "$service_name is not running on port $port"
        return 1
    fi
}

# Function to start a service
start_service() {
    local service_name=$1
    local service_dir="apps/$service_name"
    
    print_status "INFO" "Starting $service_name..."
    
    if [ ! -d "$service_dir" ]; then
        print_status "ERROR" "Service directory $service_dir not found"
        return 1
    fi
    
    cd "$service_dir"
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_status "WARNING" "No .env file found for $service_name, copying from env.example"
        cp env.example .env 2>/dev/null || true
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "INFO" "Installing dependencies for $service_name..."
        npm install
    fi
    
    # Build the service
    print_status "INFO" "Building $service_name..."
    npm run build
    
    # Start the service
    print_status "INFO" "Starting $service_name..."
    if [ -f "dist/main.js" ]; then
        node dist/main.js &
    elif [ -f "dist/apps/$service_name/src/main.js" ]; then
        node dist/apps/$service_name/src/main.js &
    else
        print_status "ERROR" "No main.js file found for $service_name"
        return 1
    fi
    
    cd - > /dev/null
    return 0
}

# Function to test service endpoints
test_service_endpoints() {
    local service_name=$1
    local port=$2
    
    print_status "INFO" "Testing endpoints for $service_name..."
    
    case $service_name in
        "auth-service")
            # Test auth endpoints
            print_status "INFO" "Testing auth registration..."
            curl -s -X POST "http://localhost:$port/api/auth/register" \
                -H "Content-Type: application/json" \
                -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}' \
                | jq . > /dev/null 2>&1 && print_status "SUCCESS" "Registration endpoint working" || print_status "WARNING" "Registration endpoint failed"
            
            print_status "INFO" "Testing auth login..."
            curl -s -X POST "http://localhost:$port/api/auth/login" \
                -H "Content-Type: application/json" \
                -d '{"email":"test@example.com","password":"password123"}' \
                | jq . > /dev/null 2>&1 && print_status "SUCCESS" "Login endpoint working" || print_status "WARNING" "Login endpoint failed"
            ;;
        "org-service")
            # Test organization endpoints
            print_status "INFO" "Testing organization endpoints..."
            curl -s "http://localhost:$port/api/organizations" \
                | jq . > /dev/null 2>&1 && print_status "SUCCESS" "Organization endpoints working" || print_status "WARNING" "Organization endpoints failed"
            ;;
        *)
            # Generic endpoint test
            curl -s "http://localhost:$port/api" \
                | jq . > /dev/null 2>&1 && print_status "SUCCESS" "Generic endpoints working" || print_status "WARNING" "Generic endpoints failed"
            ;;
    esac
}

# Main function
main() {
    print_status "INFO" "Starting PayrollX-Solana Service Testing..."
    
    # Check if Docker containers are running
    print_status "INFO" "Checking Docker containers..."
    if docker ps | grep -q "payrollx-postgres"; then
        print_status "SUCCESS" "PostgreSQL container is running"
    else
        print_status "ERROR" "PostgreSQL container is not running. Please start with: docker compose up -d postgres redis rabbitmq"
        exit 1
    fi
    
    if docker ps | grep -q "payrollx-redis"; then
        print_status "SUCCESS" "Redis container is running"
    else
        print_status "ERROR" "Redis container is not running"
        exit 1
    fi
    
    if docker ps | grep -q "payrollx-rabbitmq"; then
        print_status "SUCCESS" "RabbitMQ container is running"
    else
        print_status "ERROR" "RabbitMQ container is not running"
        exit 1
    fi
    
    # Test each service
    for service_name in "${!SERVICES[@]}"; do
        port="${SERVICES[$service_name]}"
        
        echo ""
        print_status "INFO" "=== Testing $service_name ==="
        
        # Check if service is already running
        if check_service_running "$service_name" "$port"; then
            test_service_endpoints "$service_name" "$port"
        else
            # Try to start the service
            if start_service "$service_name"; then
                # Wait a bit for the service to start
                sleep 3
                
                # Check if it's now running
                if check_service_running "$service_name" "$port"; then
                    test_service_endpoints "$service_name" "$port"
                else
                    print_status "ERROR" "Failed to start $service_name"
                fi
            else
                print_status "ERROR" "Failed to build/start $service_name"
            fi
        fi
    done
    
    echo ""
    print_status "INFO" "=== Service Testing Complete ==="
    print_status "INFO" "Check the logs above for any issues"
}

# Run main function
main "$@"
