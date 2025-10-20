# PayrollX-Solana: Enterprise Payroll System on Solana

A comprehensive enterprise payroll system built on Solana blockchain with Multi-Party Computation (MPC) threshold signatures, microservices architecture, and modern web technologies.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   API Gateway   │    │   Microservices │
│   Frontend      │◄──►│   (NestJS)      │◄──►│   (NestJS)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MPC Server    │    │   RabbitMQ      │    │   PostgreSQL    │
│   (Rust)        │◄──►│   Message Queue │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Solana        │    │   Prometheus    │    │   Grafana       │
│   Blockchain    │◄──►│   Monitoring    │◄──►│   Dashboard     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose**: For containerized services
- **Yarn**: Package manager
- **Rust**: For MPC server (if building from source)
- **Node.js 18+**: For TypeScript/JavaScript services

### One-Command Setup

```bash
# Clone the repository
git clone <repository-url>
cd payrollx-solana

# Run the complete system setup
./scripts/setup-system.sh
```

This script will:

1. ✅ Check prerequisites
2. ✅ Create environment files
3. ✅ Install dependencies
4. ✅ Build all services
5. ✅ Start infrastructure (PostgreSQL, RabbitMQ, Redis, Solana)
6. ✅ Run database migrations
7. ✅ Start all microservices
8. ✅ Start monitoring services
9. ✅ Start frontend
10. ✅ Run integration tests

### Manual Setup

If you prefer to set up services manually:

```bash
# 1. Install dependencies
yarn install

# 2. Start infrastructure
docker-compose up -d postgres rabbitmq redis solana

# 3. Run migrations
yarn db:migrate

# 4. Start MPC server
docker-compose up -d mpc-server

# 5. Start all services
docker-compose up -d

# 6. Start frontend
yarn dev
```

## 📁 Project Structure

```
payrollx-solana/
├── apps/                          # Applications
│   ├── web/                       # Next.js Frontend
│   ├── api-gateway/               # NestJS API Gateway
│   ├── auth-service/              # Authentication Service
│   ├── org-service/               # Organization Management
│   ├── employee-service/          # Employee Management
│   ├── wallet-service/            # Wallet Management
│   ├── payroll-service/           # Payroll Processing
│   ├── transaction-service/       # Transaction Management
│   ├── notification-service/      # Notifications
│   ├── compliance-service/        # Compliance & Audit
│   └── mpc-server/                # Rust MPC Server
├── packages/                      # Shared Packages
│   ├── ui/                        # UI Components
│   ├── contracts/                 # API Contracts
│   └── database/                  # Database Schemas
├── programs/                      # Solana Programs
│   └── payroll-solana/            # Anchor Program
├── monitoring/                    # Monitoring Config
├── scripts/                       # Utility Scripts
└── docker-compose.yml            # Docker Configuration
```

## 🔧 Services

### Frontend (Next.js)

- **Port**: 3000
- **Features**: Authentication, Dashboard, Employee Portal, Real-time Updates
- **Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Query

### API Gateway (NestJS)

- **Port**: 3000/api
- **Features**: Request routing, Authentication, Rate limiting, CORS
- **Tech Stack**: NestJS, PassportJS, JWT

### Microservices (NestJS)

- **Auth Service** (3001): JWT authentication, user management
- **Org Service** (3002): Organization management, KYC
- **Employee Service** (3003): Employee management, KYC processing
- **Wallet Service** (3005): MPC wallet integration
- **Payroll Service** (3006): Payroll processing, scheduling
- **Transaction Service** (3007): Solana transaction management
- **Notification Service** (3008): Email/SMS notifications
- **Compliance Service** (3009): Audit logging, compliance

### MPC Server (Rust)

- **Port**: 8080
- **Features**: Threshold signatures, key generation, secure signing
- **Tech Stack**: Actix-web, Ed25519, JWT authentication

### Infrastructure

- **PostgreSQL**: Multi-database setup for each service
- **RabbitMQ**: Message queuing for inter-service communication
- **Redis**: Caching and session storage
- **Solana**: Test validator for development

### Monitoring

- **Prometheus**: Metrics collection
- **Grafana**: Dashboards and visualization

## 🔐 Security Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Multi-factor authentication support
- Session management with Redis

### MPC Security

- Threshold signature scheme (2-of-3 by default)
- Ed25519 cryptographic signatures
- Secure key share storage
- Automatic key cleanup
- JWT authentication for MPC endpoints

### Blockchain Security

- Solana program validation
- PDA (Program Derived Address) verification
- Reentrancy protection
- Overflow checks
- Access control on all instructions

### Data Protection

- Encrypted data at rest
- Secure API communication (HTTPS)
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 🚀 Deployment

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down
```

### Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get services
```

## 📊 Monitoring & Observability

### Health Checks

- All services expose `/health` endpoints
- Automatic health monitoring
- Service discovery and load balancing

### Metrics

- Request rates and latency
- Database query performance
- RabbitMQ queue depths
- Solana transaction success rates
- Custom business metrics

### Logging

- Structured logging with correlation IDs
- Centralized log aggregation
- Real-time log streaming
- Log retention policies

### Alerting

- Critical service failures
- High error rates
- Resource utilization
- Security incidents

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
yarn test

# Run tests for specific service
yarn test:auth-service
yarn test:wallet-service
```

### Integration Tests

```bash
# Run integration tests
yarn test:integration

# Run E2E tests
yarn test:e2e
```

### Load Testing

```bash
# Run load tests
yarn test:load

# Run stress tests
yarn test:stress
```

## 🔄 CI/CD Pipeline

### GitHub Actions

- **Lint & Type Check**: On every PR
- **Unit Tests**: Automated testing
- **Build**: Docker image creation
- **Deploy**: Staging deployment on merge
- **Security**: Dependency scanning

### Deployment Stages

1. **Development**: Feature branches
2. **Staging**: Integration testing
3. **Production**: Manual approval required

## 📈 Performance

### Scalability

- Horizontal pod autoscaling
- Database connection pooling
- Redis clustering
- Load balancing

### Optimization

- Database query optimization
- Caching strategies
- CDN integration
- Image optimization

## 🛠️ Development

### Adding New Features

1. Create feature branch
2. Implement changes
3. Add tests
4. Update documentation
5. Create pull request

### Code Standards

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits

### Database Migrations

```bash
# Create migration
yarn db:migrate:create [service-name] [migration-name]

# Run migrations
yarn db:migrate

# Rollback migration
yarn db:rollback
```

## 📚 API Documentation

### Swagger/OpenAPI

- Available at `/api/docs` for each service
- Interactive API explorer
- Request/response examples
- Authentication requirements

### Postman Collection

- Import from `docs/postman/`
- Environment variables included
- Test scenarios provided

## 🔧 Configuration

### Environment Variables

Each service has its own `.env` file with:

- Database connections
- JWT secrets
- Service URLs
- Feature flags

### Feature Flags

- A/B testing support
- Gradual rollouts
- Emergency toggles
- Environment-specific configs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

### Documentation

- [API Documentation](docs/api/)
- [Architecture Guide](docs/architecture/)
- [Deployment Guide](docs/deployment/)

### Troubleshooting

- [Common Issues](docs/troubleshooting/)
- [FAQ](docs/faq/)
- [Support Contact](mailto:support@payrollx.com)

## 🎯 Roadmap

### Phase 1 (Current)

- ✅ Core payroll functionality
- ✅ MPC threshold signatures
- ✅ Basic monitoring
- ✅ Docker deployment

### Phase 2 (Next)

- 🔄 Advanced analytics
- 🔄 Mobile applications
- 🔄 Multi-currency support
- 🔄 Advanced compliance

### Phase 3 (Future)

- 📋 AI-powered insights
- 📋 Advanced security features
- 📋 Global expansion
- 📋 Enterprise integrations

---

**Built with ❤️ by the PayrollX Team**
