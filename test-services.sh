#!/bin/bash

echo "🧪 PayrollX-Solana Service Testing Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test service health
test_service() {
    local service_name=$1
    local port=$2
    local health_path=${3:-/health}
    
    echo -e "${BLUE}Testing ${service_name} on port ${port}...${NC}"
    
    if curl -s -f "http://localhost:${port}${health_path}" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ${service_name} is healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ ${service_name} is not responding${NC}"
        return 1
    fi
}

# Function to test service with API call
test_api() {
    local service_name=$1
    local port=$2
    local endpoint=$3
    local method=${4:-GET}
    local data=${5:-""}
    
    echo -e "${BLUE}Testing ${service_name} API: ${endpoint}...${NC}"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -X POST "http://localhost:${port}${endpoint}" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s "http://localhost:${port}${endpoint}")
    fi
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        echo -e "${GREEN}✅ ${service_name} API responded${NC}"
        echo "Response: $response" | head -c 100
        echo "..."
        return 0
    else
        echo -e "${RED}❌ ${service_name} API failed${NC}"
        return 1
    fi
}

# Test infrastructure services
echo -e "${YELLOW}🏗️  Testing Infrastructure Services${NC}"
echo "=================================="

test_service "PostgreSQL" 5432 "/"
test_service "RabbitMQ" 5672 "/"
test_service "Redis" 6379 "/"

# Test MPC Server
echo -e "${YELLOW}🔐 Testing MPC Server${NC}"
echo "========================"

test_service "MPC Server" 8080 "/health"
test_api "MPC Server" 8080 "/api/mpc/keygen" "POST" '{"threshold": 2, "total_shares": 3, "request_id": "test-123"}'

# Test Microservices
echo -e "${YELLOW}🏗️  Testing Microservices${NC}"
echo "========================="

test_service "Auth Service" 3001 "/health"
test_service "Organization Service" 3002 "/health"
test_service "Employee Service" 3003 "/health"
test_service "Wallet Service" 3005 "/health"
test_service "Payroll Service" 3006 "/health"
test_service "Transaction Service" 3007 "/health"
test_service "Notification Service" 3008 "/health"
test_service "Compliance Service" 3009 "/health"
test_service "API Gateway" 3000 "/health"

# Test Frontend Applications
echo -e "${YELLOW}🌐 Testing Frontend Applications${NC}"
echo "================================="

test_service "Web App" 3000 "/"
test_service "Documentation" 3001 "/"

# Test API endpoints
echo -e "${YELLOW}🔌 Testing API Endpoints${NC}"
echo "=========================="

# Test Auth Service APIs
test_api "Auth Service" 3001 "/api/auth/login" "POST" '{"email": "test@example.com", "password": "password123"}'
test_api "Auth Service" 3001 "/api/auth/register" "POST" '{"email": "test@example.com", "password": "password123", "firstName": "Test", "lastName": "User"}'

# Test Organization Service APIs
test_api "Organization Service" 3002 "/api/organizations" "GET"

# Test Employee Service APIs
test_api "Employee Service" 3003 "/api/employees" "GET"

# Test Wallet Service APIs
test_api "Wallet Service" 3005 "/api/wallets" "GET"

# Test Payroll Service APIs
test_api "Payroll Service" 3006 "/api/payrolls" "GET"

# Test Transaction Service APIs
test_api "Transaction Service" 3007 "/api/transactions" "GET"

# Test Notification Service APIs
test_api "Notification Service" 3008 "/api/notifications" "GET"

# Test Compliance Service APIs
test_api "Compliance Service" 3009 "/api/compliance/audits" "GET"

# Test API Gateway
test_api "API Gateway" 3000 "/api/health" "GET"

echo -e "${YELLOW}📊 Test Summary${NC}"
echo "==============="
echo "Tests completed. Check the results above for any failures."
echo ""
echo "To start all services:"
echo "  npm run dev -- --concurrency=15"
echo ""
echo "To start with Docker:"
echo "  ./start-docker.sh"
