import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { HealthModule } from './health/health.module';
import { GatewayModule } from './gateway/gateway.module';
import { winstonConfig } from './config/winston.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Application Root Module
 *
 * This is the root module of the API Gateway service. It imports and configures
 * all necessary modules for the gateway to function.
 *
 * Responsibilities:
 * - Configures global modules (Config, Winston logging, Throttler, JWT, etc.)
 * - Imports feature modules (Health, Gateway)
 * - Sets up application-wide configuration
 *
 * Global Configuration:
 * - ConfigModule: Loads environment variables from .env file
 * - WinstonModule: Configures structured logging
 * - ThrottlerModule: Rate limiting to prevent abuse
 * - JwtModule: JWT token validation for authentication
 * - PassportModule: Authentication strategies
 *
 * @module AppModule
 */
@Module({
  imports: [
    // Configuration Module
    // Loads environment variables from .env file
    // isGlobal: true makes ConfigService available throughout the app
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Winston Logger Module
    // Provides structured logging with file rotation
    WinstonModule.forRoot(winstonConfig),

    // Throttler Module (Rate Limiting)
    // Protects against DDoS and abuse
    // Configuration: 100 requests per 60 seconds (1 minute)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time window in milliseconds (60 seconds)
        limit: 100, // Maximum requests per time window
      },
    ]),

    // Passport Module
    // Provides authentication framework
    // Currently configured but strategies can be added later
    PassportModule,

    // JWT Module
    // Handles JSON Web Token validation and generation
    // Used for authenticating requests
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key', // Should be in .env
      signOptions: { expiresIn: '1h' }, // Token expiration time
    }),

    // HTTP Module
    // Provides HTTP client for making requests to microservices
    // Can be used by GatewayService or other services
    HttpModule,

    // Health Check Module
    // Provides /health endpoint for monitoring
    HealthModule,

    // Gateway Module
    // Core functionality: routes requests to microservices
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
