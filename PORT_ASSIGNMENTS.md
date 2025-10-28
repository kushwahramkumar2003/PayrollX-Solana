# PayrollX-Solana Port Assignments

## Infrastructure Services
- PostgreSQL: 5432
- RabbitMQ: 5672 (Admin UI: 15672)
- Redis: 6379
- Solana Test Validator: 8899

## Application Services
- API Gateway: 3000
- Auth Service: 3001
- Org Service: 3002
- Employee Service: 3003
- Wallet Service: 3004
- Payroll Service: 3005
- Transaction Service: 3006
- Notification Service: 3007
- Compliance Service: 3008
- MPC Server: 8080

## Frontend Applications
- Web-2 App: 3100 (changed from 3000 to avoid conflict)

## Notes
- API Gateway and Web-2 were both trying to use port 3000
- Web-2 now uses port 3100 to avoid conflict
- API Gateway remains on port 3000
