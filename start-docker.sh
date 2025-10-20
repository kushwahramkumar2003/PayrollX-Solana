#!/bin/bash

echo "🚀 Starting PayrollX-Solana Development Environment with Docker"
echo "================================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.dev.yml down

# Start infrastructure services first
echo "🐘 Starting infrastructure services (PostgreSQL, RabbitMQ, Redis, Solana)..."
docker compose -f docker-compose.dev.yml up -d postgres rabbitmq redis solana

# Wait for services to be ready
echo "⏳ Waiting for infrastructure services to be ready..."
sleep 30

# Initialize databases
echo "🗄️  Initializing databases..."
chmod +x scripts/init-databases.sh
./scripts/init-databases.sh

# Build and start all services
echo "🏗️  Building and starting all services..."
docker compose -f docker-compose.dev.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for all services to be ready..."
sleep 60

# Check service health
echo "🔍 Checking service health..."
echo ""
echo "📊 Service Status:"
echo "=================="

services=(
    "postgres:5432"
    "rabbitmq:5672"
    "redis:6379"
    "solana:8899"
    "mpc-server:8080"
    "auth-service:3001"
    "org-service:3002"
    "employee-service:3003"
    "wallet-service:3005"
    "payroll-service:3006"
    "transaction-service:3007"
    "notification-service:3008"
    "compliance-service:3009"
    "api-gateway:3000"
    "web:3000"
)

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -s -f http://localhost:$port/health > /dev/null 2>&1 || nc -z localhost $port 2>/dev/null; then
        echo "✅ $name (port $port) - Running"
    else
        echo "❌ $name (port $port) - Not responding"
    fi
done

echo ""
echo "🎉 PayrollX-Solana Development Environment is Ready!"
echo "=================================================="
echo ""
echo "🌐 Access URLs:"
echo "  Frontend:        http://localhost:3000"
echo "  Documentation:   http://localhost:3001"
echo "  API Gateway:     http://localhost:3000/api"
echo "  RabbitMQ Admin:  http://localhost:15672 (admin/password)"
echo ""
echo "🔧 Service URLs:"
echo "  Auth Service:    http://localhost:3001"
echo "  Org Service:     http://localhost:3002"
echo "  Employee Service: http://localhost:3003"
echo "  Wallet Service:  http://localhost:3005"
echo "  Payroll Service: http://localhost:3006"
echo "  Transaction Service: http://localhost:3007"
echo "  Notification Service: http://localhost:3008"
echo "  Compliance Service: http://localhost:3009"
echo "  MPC Server:      http://localhost:8080"
echo ""
echo "📋 Useful Commands:"
echo "  View logs:       docker compose -f docker-compose.dev.yml logs -f [service-name]"
echo "  Stop services:   docker compose -f docker-compose.dev.yml down"
echo "  Restart service: docker compose -f docker-compose.dev.yml restart [service-name]"
echo ""
echo "Happy coding! 🚀"
