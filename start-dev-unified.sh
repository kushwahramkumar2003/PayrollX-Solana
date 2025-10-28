#!/bin/bash

################################################################################
# PayrollX-Solana Unified Development Starter
# This script starts all services with proper dependency management
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$PROJECT_ROOT/logs"
MAX_RETRIES=5
RETRY_DELAY=2

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "\n${CYAN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} $1"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════╝${NC}\n"
}

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

################################################################################
# Cleanup Functions
################################################################################

cleanup() {
    print_warning "Cleaning up..."
    kill_background_processes
    exit 0
}

kill_background_processes() {
    # Kill Solana validator if running
    if [ -f "$PROJECT_ROOT/solana-validator.pid" ]; then
        local pid=$(cat "$PROJECT_ROOT/solana-validator.pid")
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid 2>/dev/null || true
            rm "$PROJECT_ROOT/solana-validator.pid"
        fi
    fi
    
    # Kill MPC server if running
    if [ -f "$PROJECT_ROOT/mpc-server.pid" ]; then
        local pid=$(cat "$PROJECT_ROOT/mpc-server.pid")
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid 2>/dev/null || true
            rm "$PROJECT_ROOT/mpc-server.pid"
        fi
    fi
    
    # Kill any node processes from our project
    pkill -f "nest start.*payrollx" 2>/dev/null || true
    pkill -f "next dev.*web-2" 2>/dev/null || true
}

stop_all_services() {
    print_header "Stopping All Services"
    
    kill_background_processes
    
    print_info "Stopping Docker infrastructure..."
    docker compose -f docker-compose.infra.yml down 2>/dev/null || true
    
    print_info "Stopping npm dev processes..."
    pkill -f "turbo run dev" 2>/dev/null || true
    
    print_status "All services stopped"
}

################################################################################
# Setup Functions
################################################################################

setup_logs() {
    print_info "Setting up log directory..."
    mkdir -p "$LOG_DIR"
    touch "$LOG_DIR/.gitkeep"
}

check_dependencies() {
    print_header "Checking Dependencies"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_status "Node.js: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_status "npm: $(npm --version)"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_status "Docker: $(docker --version)"
    
    # Check cargo (for MPC server)
    if ! command -v cargo &> /dev/null; then
        print_warning "Cargo not found - MPC server may not compile"
    else
        print_status "Cargo: $(cargo --version)"
    fi
    
    # Check solana CLI
    if ! command -v solana &> /dev/null; then
        print_warning "Solana CLI not found - using test validator from docker"
    else
        print_status "Solana CLI: $(solana --version 2>/dev/null | head -1 || echo 'installed')"
    fi
}

start_docker_services() {
    print_header "Starting Docker Infrastructure"
    
    print_info "Checking for running containers..."
    
    # Check if services are already running
    if docker ps | grep -q "payrollx_postgres" && \
       docker ps | grep -q "payrollx_rabbitmq" && \
       docker ps | grep -q "payrollx_redis"; then
        print_status "Docker services are already running"
        return 0
    fi
    
    print_info "Starting infrastructure services..."
    docker compose -f docker-compose.infra.yml up -d
    
    print_info "Waiting for services to be healthy..."
    sleep 5
    
    # Check health
    local retries=0
    while [ $retries -lt $MAX_RETRIES ]; do
        if docker ps | grep -q "payrollx_postgres" && \
           docker ps | grep -q "payrollx_rabbitmq" && \
           docker ps | grep -q "payrollx_redis"; then
            print_status "Docker services are healthy"
            return 0
        fi
        retries=$((retries + 1))
        sleep $RETRY_DELAY
    done
    
    print_error "Docker services failed to start"
    return 1
}

start_solana_validator() {
    print_header "Starting Solana Test Validator"
    
    # Check if already running
    if lsof -i :8899 >/dev/null 2>&1; then
        print_status "Solana validator already running on port 8899"
        return 0
    fi
    
    print_info "Starting Solana test validator..."
    
    cd "$PROJECT_ROOT"
    solana-test-validator --reset --quiet > "$LOG_DIR/solana-validator.log" 2>&1 &
    echo $! > "$PROJECT_ROOT/solana-validator.pid"
    
    print_info "Waiting for Solana validator to initialize..."
    sleep 3
    
    # Verify it's running
    if lsof -i :8899 >/dev/null 2>&1; then
        print_status "Solana validator started successfully"
    else
        print_warning "Solana validator may still be starting..."
    fi
}

start_mpc_server() {
    print_header "Starting MPC Server"
    
    # Check if already running
    if lsof -i :8080 >/dev/null 2>&1; then
        print_status "MPC server already running on port 8080"
        return 0
    fi
    
    # Stop existing MPC server if PID exists
    if [ -f "$PROJECT_ROOT/mpc-server.pid" ]; then
        local pid=$(cat "$PROJECT_ROOT/mpc-server.pid" 2>/dev/null || true)
        if ps -p $pid > /dev/null 2>&1; then
            print_info "Stopping existing MPC server..."
            kill $pid 2>/dev/null || true
            sleep 1
        fi
    fi
    
    print_info "Starting MPC server..."
    
    cd "$PROJECT_ROOT/apps/mpc-server"
    cargo build --release > "$LOG_DIR/mpc-server-build.log" 2>&1 &
    
    # Wait a bit for build to complete
    sleep 10
    
    # Start the server
    cd "$PROJECT_ROOT/apps/mpc-server"
    ./target/release/mpc-server > "$LOG_DIR/mpc-server.log" 2>&1 &
    echo $! > "$PROJECT_ROOT/mpc-server.pid"
    
    print_info "MPC server starting in background..."
}

build_packages() {
    print_header "Building Shared Packages"
    
    print_info "Building contracts package..."
    npm run build --workspace=@payrollx/contracts > "$LOG_DIR/contracts-build.log" 2>&1 || {
        print_error "Failed to build contracts package"
        return 1
    }
    
    print_info "Building database package..."
    npm run build --workspace=@payrollx/database > "$LOG_DIR/database-build.log" 2>&1 || {
        print_error "Failed to build database package"
        return 1
    }
    
    print_status "Shared packages built successfully"
}

setup_prisma() {
    print_header "Setting up Prisma Databases"
    
    print_info "Generating all Prisma clients..."
    cd "$PROJECT_ROOT/packages/database"
    npm run prisma:generate:all > "$LOG_DIR/prisma-generate.log" 2>&1 || {
        print_error "Failed to generate Prisma clients"
        return 1
    }
    
    print_info "Applying database migrations..."
    cd "$PROJECT_ROOT/packages/database"
    for schema_dir in prisma/auth prisma/org prisma/employee prisma/wallet prisma/payroll prisma/transaction prisma/notification prisma/compliance; do
        if [ -f "$schema_dir/schema.prisma" ]; then
            print_info "Migrating $(basename $(dirname $schema_dir)) database..."
            npx prisma migrate deploy --schema=$schema_dir/schema.prisma >> "$LOG_DIR/prisma-migrate.log" 2>&1 || {
                print_warning "Migration for $(basename $(dirname $schema_dir)) had issues"
            }
        fi
    done
    
    print_status "Prisma setup complete"
}

start_microservices() {
    print_header "Starting Microservices"
    
    print_info "Starting all microservices with concurrency=20..."
    
    cd "$PROJECT_ROOT"
    
    # Start services and redirect all output to logs
    # Note: concurrency is already set in package.json, so don't add it again
    nohup npm run dev > "$LOG_DIR/microservices.log" 2>&1 &
    echo $! > "$LOG_DIR/microservices.pid"
    
    print_info "Microservices starting in background..."
    sleep 3
    
    # Check if process is still running
    local pid=$(cat "$LOG_DIR/microservices.pid" 2>/dev/null)
    if ps -p $pid > /dev/null 2>&1; then
        print_status "Microservices process started (PID: $pid)"
    else
        print_warning "Process may have exited, but services are building..."
        print_info "Check logs: tail -f $LOG_DIR/microservices.log"
    fi
}

wait_for_services() {
    print_header "Waiting for Services to be Ready"
    
    local timeout=120
    local elapsed=0
    
    print_info "Waiting for services to start (timeout: ${timeout}s)..."
    
    while [ $elapsed -lt $timeout ]; do
        local healthy_services=0
        local total_services=10
        
        # Check each service port
        for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008; do
            if curl -s http://localhost:$port/health >/dev/null 2>&1; then
                healthy_services=$((healthy_services + 1))
            fi
        done
        
        # Check frontend
        if lsof -i :3100 >/dev/null 2>&1; then
            healthy_services=$((healthy_services + 1))
        fi
        
        if [ $healthy_services -ge 8 ]; then
            print_status "Services are ready! ($healthy_services/$total_services)"
            return 0
        fi
        
        echo -ne "\r⏳ Waiting... ($elapsed/$timeout seconds) - $healthy_services/$total_services services ready"
        sleep 2
        elapsed=$((elapsed + 2))
    done
    
    echo ""
    print_warning "Some services may still be starting..."
    return 0
}

show_status() {
    print_header "PayrollX-Solana Status"
    
    echo ""
    echo -e "${GREEN}✅ INFRASTRUCTURE SERVICES${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if docker ps | grep -q "payrollx_postgres"; then
        print_status "PostgreSQL       : Running (localhost:5432)"
    else
        print_error "PostgreSQL       : Not running"
    fi
    
    if docker ps | grep -q "payrollx_rabbitmq"; then
        print_status "RabbitMQ         : Running (localhost:5672, admin:15672)"
    else
        print_error "RabbitMQ         : Not running"
    fi
    
    if docker ps | grep -q "payrollx_redis"; then
        print_status "Redis            : Running (localhost:6379)"
    else
        print_error "Redis            : Not running"
    fi
    
    echo ""
    echo -e "${GREEN}✅ BLOCKCHAIN SERVICES${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if lsof -i :8899 >/dev/null 2>&1; then
        print_status "Solana Test Validator : Running (localhost:8899)"
    else
        print_error "Solana Test Validator : Not running"
    fi
    
    if lsof -i :8080 >/dev/null 2>&1; then
        print_status "MPC Server            : Running (localhost:8080)"
    else
        print_error "MPC Server            : Not running"
    fi
    
    echo ""
    echo -e "${GREEN}✅ MICROSERVICES${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local ports=(3000 3001 3002 3003 3004 3005 3006 3007 3008)
    local names=("API Gateway" "Auth" "Org" "Employee" "Wallet" "Payroll" "Transaction" "Notification" "Compliance")
    
    for i in "${!ports[@]}"; do
        if curl -s http://localhost:${ports[$i]}/health >/dev/null 2>&1; then
            print_status "${names[$i]} Service : Running (localhost:${ports[$i]})"
        else
            print_error "${names[$i]} Service : Not responding"
        fi
    done
    
    echo ""
    echo -e "${GREEN}✅ FRONTEND${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if lsof -i :3100 >/dev/null 2>&1; then
        print_status "Web App         : Running (http://localhost:3100)"
    else
        print_error "Web App         : Not running"
    fi
    
    echo ""
    echo -e "${BLUE}📝 LOGS${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  View all logs    : tail -f $LOG_DIR/*.log"
    echo "  Microservices    : tail -f $LOG_DIR/microservices.log"
    echo "  Solana           : tail -f $LOG_DIR/solana-validator.log"
    echo "  MPC Server       : tail -f $LOG_DIR/mpc-server.log"
    echo ""
}

################################################################################
# Main Functions
################################################################################

main() {
    local command="${1:-start}"
    
    case "$command" in
        "start")
            start_all
            ;;
        "stop")
            stop_all_services
            ;;
        "status")
            show_status
            ;;
        "restart")
            stop_all_services
            sleep 2
            start_all
            ;;
        *)
            echo "Usage: $0 {start|stop|status|restart}"
            exit 1
            ;;
    esac
}

start_all() {
    print_header "PayrollX-Solana Development Starter"
    
    # Kill existing processes on application ports
    print_info "Clearing application ports..."
    bash "$PROJECT_ROOT/kill-ports.sh" 2>/dev/null || true
    
    # Setup
    setup_logs
    check_dependencies
    
    # Cleanup on exit
    trap cleanup SIGINT SIGTERM
    
    # Start services
    start_docker_services || {
        print_error "Failed to start Docker services"
        exit 1
    }
    
    start_solana_validator || {
        print_error "Failed to start Solana validator"
        exit 1
    }
    
    start_mpc_server || {
        print_warning "Failed to start MPC server (may already be running)"
    }
    
    build_packages || {
        print_error "Failed to build packages"
        exit 1
    }
    
    setup_prisma || {
        print_warning "Prisma setup had issues, continuing anyway..."
    }
    
    start_microservices || {
        print_error "Failed to start microservices"
        exit 1
    }
    
    # Wait and show status
    wait_for_services
    show_status
    
    echo ""
    print_header "All Services Started!"
    echo ""
    echo -e "${GREEN}🌐 Access the application at: http://localhost:3100${NC}"
    echo ""
    echo -e "${YELLOW}📝 To view logs: tail -f $LOG_DIR/*.log${NC}"
    echo -e "${YELLOW}🛑 To stop all services: $0 stop${NC}"
    echo ""
}

################################################################################
# Execute
################################################################################

main "$@"
