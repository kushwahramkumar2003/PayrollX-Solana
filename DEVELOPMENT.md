# PayrollX Development Setup

This guide explains how to run the PayrollX application locally for development.

## Prerequisites

Before starting, ensure you have the following installed on your machine:

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Docker & Docker Compose** - [Download](https://www.docker.com/products/docker-desktop/)
- **Rust** (latest stable) - [Install](https://rustup.rs/)
- **Anchor Framework** - [Install](https://www.anchor-lang.com/docs/installation)

### Verify Installation
```bash
node --version    # Should be v18+
npm --version     # Should be v9+
docker --version  # Should be v20+
docker-compose --version  # Should be v2+
rustc --version   # Should be latest stable
cargo --version   # Should be latest stable
anchor --version  # Should be latest
```

## Quick Start

### 1. Start Infrastructure Services
```bash
# Start only PostgreSQL, Redis, and RabbitMQ in Docker
npm run dev:infra
```

### 2. Start All Services
```bash
# Start the entire application (infrastructure + microservices + frontend)
npm run dev:start
```

### 3. Check Status
```bash
# View running services and their ports
npm run dev:status
```

### 4. Stop All Services
```bash
# Stop all services
npm run dev:stop
```

## Manual Setup (Alternative)

If you prefer to start services manually:

### 1. Start Infrastructure
```bash
docker-compose -f docker-compose.infra.yml up -d
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build Packages
```bash
npm run build:packages
```

### 4. Start Solana Test Validator
```bash
solana-test-validator --reset
```

### 5. Start MPC Server
```bash
cd apps/mpc-server
cargo run
```

### 6. Start Microservices
```bash
# In separate terminals
npm run dev --workspace=@payrollx/auth-service
npm run dev --workspace=@payrollx/api-gateway
npm run dev --workspace=@payrollx/org-service
npm run dev --workspace=@payrollx/employee-service
npm run dev --workspace=@payrollx/wallet-service
npm run dev --workspace=@payrollx/payroll-service
npm run dev --workspace=@payrollx/transaction-service
npm run dev --workspace=@payrollx/notification-service
npm run dev --workspace=@payrollx/compliance-service
```

### 7. Start Frontend
```bash
npm run dev --workspace=web
```

## Service Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3001 | http://localhost:3001 |
| API Gateway | 3000 | http://localhost:3000 |
| Auth Service | 3001 | http://localhost:3001 |
| Org Service | 3002 | http://localhost:3002 |
| Employee Service | 3003 | http://localhost:3003 |
| Wallet Service | 3004 | http://localhost:3004 |
| Payroll Service | 3005 | http://localhost:3005 |
| Transaction Service | 3006 | http://localhost:3006 |
| Notification Service | 3007 | http://localhost:3007 |
| Compliance Service | 3008 | http://localhost:3008 |
| MPC Server | 8080 | http://localhost:8080 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| RabbitMQ | 5672 | localhost:5672 |
| RabbitMQ Management | 15672 | http://localhost:15672 |
| Solana Test Validator | 8899 | http://localhost:8899 |

## Environment Configuration

The application uses environment variables for configuration. The default development configuration is in `env.local`:

- **Database**: PostgreSQL on localhost:5432
- **Cache**: Redis on localhost:6379
- **Message Queue**: RabbitMQ on localhost:5672
- **Blockchain**: Solana test validator on localhost:8899

## Development Workflow

### 1. Code Changes
- Make changes to any service
- The service will automatically restart (if using `npm run dev`)
- Check logs in the respective `.log` files

### 2. Database Changes
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate
```

### 3. Testing
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests for specific service
npm run test --workspace=@payrollx/auth-service
```

### 4. Linting & Formatting
```bash
# Run linter
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Docker Issues**
   ```bash
   # Restart Docker
   docker-compose -f docker-compose.infra.yml down
   docker-compose -f docker-compose.infra.yml up -d
   ```

3. **Database Connection Issues**
   ```bash
   # Check if PostgreSQL is running
   docker ps | grep postgres
   
   # Check logs
   docker logs payrollx_postgres
   ```

4. **Service Not Starting**
   ```bash
   # Check service logs
   tail -f auth-service.log
   
   # Check if dependencies are installed
   npm install
   ```

### Logs

All services generate log files:
- `solana-validator.log` - Solana test validator logs
- `mpc-server.log` - MPC server logs
- `web.log` - Frontend logs
- `{service-name}.log` - Individual microservice logs

### Clean Restart

If you encounter issues, try a clean restart:

```bash
# Stop all services
npm run dev:stop

# Clean up
rm -f *.log *.pid

# Restart
npm run dev:start
```

## Architecture

The application follows a microservices architecture:

- **Frontend**: Next.js application (port 3001)
- **API Gateway**: Routes requests to microservices (port 3000)
- **Microservices**: Individual services for different domains
- **Infrastructure**: PostgreSQL, Redis, RabbitMQ in Docker
- **Blockchain**: Solana test validator and MPC server locally

## Contributing

1. Make your changes
2. Test locally using the development setup
3. Run tests and linting
4. Submit a pull request

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Check service logs
3. Verify all prerequisites are installed
4. Create an issue with detailed error information
