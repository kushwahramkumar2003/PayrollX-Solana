#!/bin/bash

# PayrollX Development Script
# This script starts the entire PayrollX application locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for a service to be ready
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service_name to be ready on $host:$port..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z $host $port 2>/dev/null; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# Function to start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services (PostgreSQL, Redis, RabbitMQ)..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Start infrastructure services
    docker-compose -f docker-compose.infra.yml up -d
    
    # Wait for services to be ready
    wait_for_service localhost 5432 "PostgreSQL"
    wait_for_service localhost 6379 "Redis"
    wait_for_service localhost 5672 "RabbitMQ"
    
    print_success "Infrastructure services are running!"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check for required commands
    local missing_commands=()
    
    if ! command_exists node; then
        missing_commands+=("node")
    fi
    
    if ! command_exists npm; then
        missing_commands+=("npm")
    fi
    
    if ! command_exists rustc; then
        missing_commands+=("rustc")
    fi
    
    if ! command_exists cargo; then
        missing_commands+=("cargo")
    fi
    
    if ! command_exists anchor; then
        missing_commands+=("anchor")
    fi
    
    if [ ${#missing_commands[@]} -ne 0 ]; then
        print_error "Missing required commands: ${missing_commands[*]}"
        print_error "Please install the missing dependencies and try again."
        exit 1
    fi
    
    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_warning "Node.js version is $node_version. Recommended version is 18 or higher."
    fi
    
    print_success "Prerequisites check passed!"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies with legacy peer deps to handle React 19 conflicts
    print_warning "Using --legacy-peer-deps to handle React 19 dependency conflicts..."
    npm install --legacy-peer-deps
    
    print_success "Dependencies installed!"
}

# Function to build packages
build_packages() {
    print_status "Building shared packages..."
    
    # Generate Prisma clients first
    print_status "Generating Prisma clients..."
    npm run db:generate
    
    # Setup database schemas
    print_status "Setting up database schemas..."
    cd packages/database
    for schema in prisma/*/schema.prisma; do
        echo "Pushing $schema..."
        DATABASE_URL="postgresql://admin:adminpass@localhost:5432/payrollx_main" npx prisma db push --schema="$schema" --skip-generate >/dev/null 2>&1
    done
    cd ../..
    
    # Build packages in order
    npm run build --workspace=@payrollx/common
    npm run build --workspace=@payrollx/contracts
    npm run build --workspace=@payrollx/database
    
    print_success "Packages built!"
}

# Function to start Solana test validator
start_solana() {
    print_status "Starting Solana test validator..."
    
    if ! command_exists solana-test-validator; then
        print_warning "solana-test-validator not found. Please install Solana CLI tools."
        print_warning "Skipping Solana test validator..."
        return 0
    fi
    
    # Check if validator is already running
    if port_in_use 8899; then
        print_warning "Solana test validator is already running on port 8899"
        return 0
    fi
    
    # Start Solana test validator in background
    solana-test-validator --reset > solana-validator.log 2>&1 &
    local solana_pid=$!
    echo $solana_pid > solana-validator.pid
    
    # Wait for validator to be ready
    wait_for_service localhost 8899 "Solana test validator"
    
    print_success "Solana test validator is running!"
}

# Function to start MPC server
start_mpc_server() {
    print_status "Starting MPC server..."
    
    if ! command_exists cargo; then
        print_warning "Cargo not found. Skipping MPC server..."
        return 0
    fi
    
    # Check if MPC server is already running
    if port_in_use 8080; then
        print_warning "MPC server is already running on port 8080"
        return 0
    fi
    
    # Build and start MPC server
    cd apps/mpc-server
    cargo run > ../../mpc-server.log 2>&1 &
    local mpc_pid=$!
    echo $mpc_pid > ../../mpc-server.pid
    cd ../..
    
    # Wait for MPC server to be ready (give it more time)
    print_status "Waiting for MPC server to compile and start (this may take a minute)..."
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z localhost 8080 2>/dev/null; then
            print_success "MPC server is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_warning "MPC server is taking longer than expected to start"
    print_warning "Check mpc-server.log for details. Continuing with other services..."
    return 0
}

# Function to start microservices
start_microservices() {
    print_status "Starting microservices..."
    
    # Start services in background
    local services=(
        "api-gateway:3000"
        "auth-service:3001"
        "org-service:3002"
        "employee-service:3003"
        "wallet-service:3004"
        "payroll-service:3005"
        "transaction-service:3006"
        "notification-service:3007"
        "compliance-service:3008"
    )
    
    for service in "${services[@]}"; do
        local service_name=$(echo $service | cut -d':' -f1)
        local port=$(echo $service | cut -d':' -f2)
        
        # Check if service is already running
        if port_in_use $port; then
            print_warning "$service_name is already running on port $port"
            continue
        fi
        
        print_status "Starting $service_name on port $port..."
        
        # Start service in background
        npm run dev --workspace=@payrollx/$service_name > $service_name.log 2>&1 &
        local service_pid=$!
        echo $service_pid > $service_name.pid
        
        # Wait for service to be ready
        wait_for_service localhost $port "$service_name"
    done
    
    print_success "All microservices are running!"
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend..."
    
    # Check if frontend is already running
    if port_in_use 3009; then
        print_warning "Frontend is already running on port 3009"
        return 0
    fi
    
    # Start frontend in background
    npm run dev --workspace=web > web.log 2>&1 &
    local web_pid=$!
    echo $web_pid > web.pid
    
    # Wait for frontend to be ready
    wait_for_service localhost 3009 "Frontend"
    
    print_success "Frontend is running!"
}

# Function to show status
show_status() {
    print_status "Application Status:"
    echo ""
    echo "Infrastructure Services:"
    echo "  PostgreSQL: http://localhost:5432"
    echo "  Redis: http://localhost:6379"
    echo "  RabbitMQ Management: http://localhost:15672 (admin/adminpass)"
    echo ""
    echo "Blockchain Services:"
    echo "  Solana Test Validator: http://localhost:8899"
    echo "  MPC Server: http://localhost:8080"
    echo ""
    echo "Microservices:"
    echo "  API Gateway: http://localhost:3000"
    echo "  Auth Service: http://localhost:3001"
    echo "  Org Service: http://localhost:3002"
    echo "  Employee Service: http://localhost:3003"
    echo "  Wallet Service: http://localhost:3004"
    echo "  Payroll Service: http://localhost:3005"
    echo "  Transaction Service: http://localhost:3006"
    echo "  Notification Service: http://localhost:3007"
    echo "  Compliance Service: http://localhost:3008"
    echo ""
    echo "Frontend:"
    echo "  Web App: http://localhost:3009"
    echo ""
    echo "Logs are available in the following files:"
    echo "  solana-validator.log"
    echo "  mpc-server.log"
    echo "  web.log"
    echo "  *.log (for each microservice)"
}

# Function to stop all services
stop_all() {
    print_status "Stopping all services..."
    
    # Stop infrastructure services
    docker-compose -f docker-compose.infra.yml down
    
    # Stop local services
    for pidfile in *.pid; do
        if [ -f "$pidfile" ]; then
            local pid=$(cat "$pidfile")
            if kill -0 $pid 2>/dev/null; then
                kill $pid
                print_status "Stopped process $pid"
            fi
            rm "$pidfile"
        fi
    done
    
    print_success "All services stopped!"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up..."
    stop_all
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    print_status "Starting PayrollX Development Environment..."
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies
    install_dependencies
    
    # Build packages
    build_packages
    
    # Start infrastructure
    start_infrastructure
    
    # Start Solana test validator
    start_solana
    
    # Start MPC server
    start_mpc_server
    
    # Start microservices
    start_microservices
    
    # Start frontend
    start_frontend
    
    # Show status
    show_status
    
    print_success "PayrollX Development Environment is ready!"
    print_status "Press Ctrl+C to stop all services"
    
    # Keep script running
    while true; do
        sleep 1
    done
}

# Handle command line arguments
case "${1:-}" in
    "stop")
        stop_all
        ;;
    "status")
        show_status
        ;;
    "restart")
        stop_all
        sleep 2
        main
        ;;
    *)
        main
        ;;
esac
