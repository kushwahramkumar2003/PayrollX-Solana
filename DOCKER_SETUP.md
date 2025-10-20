# PayrollX-Solana Docker Setup Guide

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ and npm (for local development)
- Git

### Start the Complete Development Environment

```bash
# Make the startup script executable and run it
chmod +x start-docker.sh
./start-docker.sh
```

This will:

1. Start all infrastructure services (PostgreSQL, RabbitMQ, Redis, Solana)
2. Initialize all databases
3. Build and start all microservices
4. Check service health
5. Display access URLs

## 🏗️ Architecture Overview

The PayrollX-Solana system consists of:

### Infrastructure Services

- **PostgreSQL**: 8 separate databases for each microservice
- **RabbitMQ**: Message broker for inter-service communication
- **Redis**: Caching and session storage
- **Solana Test Validator**: Blockchain for payroll transactions

### Microservices

- **API Gateway** (Port 3000): Main entry point, routes requests to services
- **Auth Service** (Port 3001): User authentication and authorization
- **Organization Service** (Port 3002): Organization management
- **Employee Service** (Port 3003): Employee data management
- **Wallet Service** (Port 3005): MPC wallet management
- **Payroll Service** (Port 3006): Payroll processing and scheduling
- **Transaction Service** (Port 3007): Blockchain transaction handling
- **Notification Service** (Port 3008): Email and SMS notifications
- **Compliance Service** (Port 3009): Regulatory compliance and reporting
- **MPC Server** (Port 8080): Multi-party computation for secure key management

### Frontend Applications

- **Web App** (Port 3000): Main user interface
- **Documentation** (Port 3001): API documentation

## 🌐 Service URLs

Once running, access the services at:

| Service        | URL                       | Description                                |
| -------------- | ------------------------- | ------------------------------------------ |
| Web Frontend   | http://localhost:3000     | Main application interface                 |
| API Gateway    | http://localhost:3000/api | API endpoint                               |
| Documentation  | http://localhost:3001     | API documentation                          |
| RabbitMQ Admin | http://localhost:15672    | Message broker management (admin/password) |

### Individual Service Health Checks

- Auth Service: http://localhost:3001/health
- Org Service: http://localhost:3002/health
- Employee Service: http://localhost:3003/health
- Wallet Service: http://localhost:3005/health
- Payroll Service: http://localhost:3006/health
- Transaction Service: http://localhost:3007/health
- Notification Service: http://localhost:3008/health
- Compliance Service: http://localhost:3009/health
- MPC Server: http://localhost:8080/health

## 🐳 Docker Commands

### Start Services

```bash
# Start all services
docker compose -f docker-compose.dev.yml up -d

# Start specific services
docker compose -f docker-compose.dev.yml up -d postgres rabbitmq redis

# Build and start (if you made changes)
docker compose -f docker-compose.dev.yml up -d --build
```

### Stop Services

```bash
# Stop all services
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (WARNING: This will delete all data)
docker compose -f docker-compose.dev.yml down -v
```

### View Logs

```bash
# View logs for all services
docker compose -f docker-compose.dev.yml logs -f

# View logs for specific service
docker compose -f docker-compose.dev.yml logs -f auth-service

# View logs for multiple services
docker compose -f docker-compose.dev.yml logs -f auth-service org-service
```

### Restart Services

```bash
# Restart all services
docker compose -f docker-compose.dev.yml restart

# Restart specific service
docker compose -f docker-compose.dev.yml restart auth-service
```

### Execute Commands in Containers

```bash
# Access PostgreSQL
docker exec -it payrollx-postgres psql -U admin -d payrollx_auth

# Access Redis CLI
docker exec -it payrollx-redis redis-cli

# Access any service container
docker exec -it payrollx-auth-service sh
```

## 🗄️ Database Management

### Database URLs

Each service connects to its own database:

- Auth Service: `postgresql://admin:password@postgres:5432/payrollx_auth`
- Org Service: `postgresql://admin:password@postgres:5432/payrollx_org`
- Employee Service: `postgresql://admin:password@postgres:5432/payrollx_employee`
- Wallet Service: `postgresql://admin:password@postgres:5432/payrollx_wallet`
- Payroll Service: `postgresql://admin:password@postgres:5432/payrollx_payroll`
- Transaction Service: `postgresql://admin:password@postgres:5432/payrollx_transaction`
- Notification Service: `postgresql://admin:password@postgres:5432/payrollx_notification`
- Compliance Service: `postgresql://admin:password@postgres:5432/payrollx_compliance`

### Initialize Databases

```bash
# Run database initialization script
./scripts/init-databases.sh

# Or manually create databases
docker exec payrollx-postgres psql -U admin -d postgres -c "CREATE DATABASE payrollx_auth;"
# ... repeat for other databases
```

### Generate Prisma Clients

```bash
# Generate all Prisma clients
npm run db:generate

# Or run from database package
cd packages/database
npm run prisma:generate:all
```

## 🔧 Development Workflow

### Making Changes to Services

1. **Edit Code**: Make your changes in the service files
2. **Rebuild Service**: `docker compose -f docker-compose.dev.yml build [service-name]`
3. **Restart Service**: `docker compose -f docker-compose.dev.yml restart [service-name]`

### Adding New Dependencies

1. **Update package.json**: Add dependencies to the service's package.json
2. **Rebuild Service**: `docker compose -f docker-compose.dev.yml build [service-name]`
3. **Restart Service**: `docker compose -f docker-compose.dev.yml restart [service-name]`

### Database Schema Changes

1. **Update Prisma Schema**: Modify the schema in `packages/database/prisma/`
2. **Generate Clients**: `npm run db:generate`
3. **Rebuild Services**: `docker compose -f docker-compose.dev.yml build`
4. **Restart Services**: `docker compose -f docker-compose.dev.yml restart`

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check service logs
docker compose -f docker-compose.dev.yml logs [service-name]

# Check if ports are in use
netstat -tlnp | grep :300[0-9]

# Check Docker resources
docker system df
docker system prune  # Clean up unused resources
```

### Database Connection Issues

```bash
# Check PostgreSQL status
docker exec payrollx-postgres pg_isready -U admin

# Check database exists
docker exec payrollx-postgres psql -U admin -d postgres -c "\l"

# Reset databases (WARNING: Deletes all data)
docker compose -f docker-compose.dev.yml down -v
docker volume rm payrollx-solana_postgres_data
```

### MPC Server Issues

```bash
# Check Rust compilation
cd apps/mpc-server
cargo check

# View MPC server logs
docker compose -f docker-compose.dev.yml logs -f mpc-server
```

### Network Issues

```bash
# Check Docker networks
docker network ls
docker network inspect payrollx-solana_payrollx-network

# Restart Docker network
docker compose -f docker-compose.dev.yml down
docker network prune
docker compose -f docker-compose.dev.yml up -d
```

## 📊 Monitoring

### Health Checks

All services have health check endpoints that return status information:

```bash
# Check all service health
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Org Service
# ... etc
```

### Resource Usage

```bash
# View container resource usage
docker stats

# View specific container stats
docker stats payrollx-auth-service
```

## 🔒 Security Notes

- All services run in isolated Docker containers
- Database credentials are set via environment variables
- JWT secrets should be changed in production
- MPC server uses secure key generation (simplified for development)
- All inter-service communication uses internal Docker networks

## 🚀 Production Deployment

For production deployment:

1. Use production Docker images
2. Set up proper secrets management
3. Configure SSL/TLS certificates
4. Set up monitoring and logging
5. Use production-grade databases
6. Implement proper backup strategies

---

**Happy coding! 🎉**
