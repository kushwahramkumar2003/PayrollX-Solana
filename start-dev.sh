#!/bin/bash

echo "🚀 Starting PayrollX-Solana Development Environment..."

# Check if Docker services are running
echo "📋 Checking infrastructure services..."
if ! docker ps | grep -q payrollx-postgres; then
    echo "🐘 Starting PostgreSQL..."
    docker compose up -d postgres
fi

if ! docker ps | grep -q payrollx-rabbitmq; then
    echo "🐰 Starting RabbitMQ..."
    docker compose up -d rabbitmq
fi

if ! docker ps | grep -q payrollx-redis; then
    echo "🔴 Starting Redis..."
    docker compose up -d redis
fi

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Start the development environment
echo "🎯 Starting all services..."
npm run dev -- --concurrency=15

echo "✅ Development environment started!"
echo "🌐 Web App: http://localhost:3000"
echo "📚 Docs: http://localhost:3001"
echo "🔧 API Gateway: http://localhost:3000/api"
echo "🔐 Auth Service: http://localhost:3001"
echo "🏢 Org Service: http://localhost:3002"
echo "👥 Employee Service: http://localhost:3003"
echo "💼 Wallet Service: http://localhost:3005"
echo "💰 Payroll Service: http://localhost:3006"
echo "📊 Transaction Service: http://localhost:3007"
echo "📧 Notification Service: http://localhost:3008"
echo "📋 Compliance Service: http://localhost:3009"
echo "🔐 MPC Server: http://localhost:8080"
