#!/bin/bash

# PayrollX-Solana Service Fix Script
# This script applies the same fixes used for Auth and Organization services to all remaining services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to fix TypeScript configuration
fix_tsconfig() {
    local service_name=$1
    local service_dir="apps/$service_name"
    
    print_status "INFO" "Fixing TypeScript configuration for $service_name..."
    
    if [ ! -f "$service_dir/tsconfig.json" ]; then
        print_status "ERROR" "tsconfig.json not found for $service_name"
        return 1
    fi
    
    # Create backup
    cp "$service_dir/tsconfig.json" "$service_dir/tsconfig.json.backup"
    
    # Update tsconfig.json
    cat > "$service_dir/tsconfig.json" << EOF
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "../../",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "moduleResolution": "node",
    "module": "CommonJS"
  }
}
EOF
    
    print_status "SUCCESS" "TypeScript configuration fixed for $service_name"
}

# Function to fix Prisma service
fix_prisma_service() {
    local service_name=$1
    local service_dir="apps/$service_name"
    local prisma_service_file="$service_dir/src/prisma/prisma.service.ts"
    
    print_status "INFO" "Fixing Prisma service for $service_name..."
    
    if [ ! -f "$prisma_service_file" ]; then
        print_status "ERROR" "Prisma service file not found for $service_name"
        return 1
    fi
    
    # Create backup
    cp "$prisma_service_file" "$prisma_service_file.backup"
    
    # Get the database connection function name based on service
    local db_connection_func=""
    case $service_name in
        "employee-service")
            db_connection_func="createEmployeeDbConnection"
            ;;
        "wallet-service")
            db_connection_func="createWalletDbConnection"
            ;;
        "payroll-service")
            db_connection_func="createPayrollDbConnection"
            ;;
        "transaction-service")
            db_connection_func="createTransactionDbConnection"
            ;;
        "notification-service")
            db_connection_func="createNotificationDbConnection"
            ;;
        "compliance-service")
            db_connection_func="createComplianceDbConnection"
            ;;
        *)
            print_status "ERROR" "Unknown service: $service_name"
            return 1
            ;;
    esac
    
    # Update Prisma service file
    cat > "$prisma_service_file" << EOF
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { $db_connection_func } from "@payrollx/database";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private prisma = $db_connection_func();

  async onModuleInit() {
    try {
      await this.prisma.\$connect();
      this.logger.log("Database connected successfully");
    } catch (error) {
      this.logger.error("Database connection failed:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.prisma.\$disconnect();
      this.logger.log("Database disconnected successfully");
    } catch (error) {
      this.logger.error("Database disconnection failed:", error);
      throw error;
    }
  }

  // Expose the prisma client properties
  get \$queryRaw() {
    return this.prisma.\$queryRaw;
  }
}
EOF
    
    print_status "SUCCESS" "Prisma service fixed for $service_name"
}

# Function to create environment file
create_env_file() {
    local service_name=$1
    local service_dir="apps/$service_name"
    local env_file="$service_dir/.env"
    local example_file="$service_dir/env.example"
    
    print_status "INFO" "Creating environment file for $service_name..."
    
    if [ ! -f "$example_file" ]; then
        print_status "WARNING" "env.example not found for $service_name, creating basic .env"
        cat > "$env_file" << EOF
DATABASE_URL="postgresql://admin:password@localhost:5432/payrollx_${service_name%%-service}"
PORT=3000
NODE_ENV="development"
LOG_LEVEL="info"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
REDIS_URL="redis://localhost:6379"
RABBITMQ_URL="amqp://admin:password@localhost:5672"
EOF
    else
        cp "$example_file" "$env_file"
        
        # Update database URL based on service
        local db_name=""
        case $service_name in
            "employee-service")
                db_name="payrollx_employee"
                ;;
            "wallet-service")
                db_name="payrollx_wallet"
                ;;
            "payroll-service")
                db_name="payrollx_payroll"
                ;;
            "transaction-service")
                db_name="payrollx_transaction"
                ;;
            "notification-service")
                db_name="payrollx_notification"
                ;;
            "compliance-service")
                db_name="payrollx_compliance"
                ;;
        esac
        
        # Update DATABASE_URL in .env file
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://admin:password@localhost:5432/$db_name\"|" "$env_file"
        
        # Update PORT based on service
        local port=""
        case $service_name in
            "employee-service")
                port="3003"
                ;;
            "wallet-service")
                port="3004"
                ;;
            "payroll-service")
                port="3005"
                ;;
            "transaction-service")
                port="3006"
                ;;
            "notification-service")
                port="3007"
                ;;
            "compliance-service")
                port="3008"
                ;;
        esac
        
        if [ ! -z "$port" ]; then
            sed -i "s|PORT=.*|PORT=$port|" "$env_file"
        fi
    fi
    
    print_status "SUCCESS" "Environment file created for $service_name"
}

# Function to run database migration
run_migration() {
    local service_name=$1
    local service_dir="apps/$service_name"
    
    print_status "INFO" "Running database migration for $service_name..."
    
    # Get the schema file name
    local schema_file=""
    case $service_name in
        "employee-service")
            schema_file="employee.prisma"
            ;;
        "wallet-service")
            schema_file="wallet.prisma"
            ;;
        "payroll-service")
            schema_file="payroll.prisma"
            ;;
        "transaction-service")
            schema_file="transaction.prisma"
            ;;
        "notification-service")
            schema_file="notification.prisma"
            ;;
        "compliance-service")
            schema_file="compliance.prisma"
            ;;
    esac
    
    if [ -z "$schema_file" ]; then
        print_status "ERROR" "Unknown schema file for service: $service_name"
        return 1
    fi
    
    # Get database name
    local db_name=""
    case $service_name in
        "employee-service")
            db_name="payrollx_employee"
            ;;
        "wallet-service")
            db_name="payrollx_wallet"
            ;;
        "payroll-service")
            db_name="payrollx_payroll"
            ;;
        "transaction-service")
            db_name="payrollx_transaction"
            ;;
        "notification-service")
            db_name="payrollx_notification"
            ;;
        "compliance-service")
            db_name="payrollx_compliance"
            ;;
    esac
    
    # Run migration
    cd packages/database
    DATABASE_URL="postgresql://admin:password@localhost:5432/$db_name" npx prisma migrate dev --name init --schema=prisma/$schema_file
    cd ../..
    
    print_status "SUCCESS" "Database migration completed for $service_name"
}

# Function to build service
build_service() {
    local service_name=$1
    local service_dir="apps/$service_name"
    
    print_status "INFO" "Building $service_name..."
    
    cd "$service_dir"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "INFO" "Installing dependencies for $service_name..."
        npm install
    fi
    
    # Build the service
    npm run build
    
    cd ../..
    
    print_status "SUCCESS" "$service_name built successfully"
}

# Function to fix a single service
fix_service() {
    local service_name=$1
    
    echo ""
    print_status "INFO" "=== Fixing $service_name ==="
    
    # Fix TypeScript configuration
    fix_tsconfig "$service_name"
    
    # Fix Prisma service
    fix_prisma_service "$service_name"
    
    # Create environment file
    create_env_file "$service_name"
    
    # Run database migration
    run_migration "$service_name"
    
    # Build service
    build_service "$service_name"
    
    print_status "SUCCESS" "$service_name fixed successfully!"
}

# Main function
main() {
    print_status "INFO" "Starting PayrollX-Solana Service Fixes..."
    
    # List of services to fix (excluding auth-service and org-service which are already working)
    local services=(
        "employee-service"
        "wallet-service"
        "payroll-service"
        "transaction-service"
        "notification-service"
        "compliance-service"
    )
    
    # Fix each service
    for service in "${services[@]}"; do
        fix_service "$service"
    done
    
    echo ""
    print_status "INFO" "=== All Services Fixed ==="
    print_status "INFO" "You can now run ./test-all-services.sh to test all services"
}

# Run main function
main "$@"
