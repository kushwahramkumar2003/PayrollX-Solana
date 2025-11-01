import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { winstonConfig } from './config/winston.config';

/**
 * Bootstrap Function
 *
 * This is the entry point of the API Gateway application.
 * It initializes the NestJS application and configures:
 * - Security middleware (Helmet)
 * - Compression middleware
 * - Global validation pipe
 * - CORS configuration
 * - Swagger documentation
 * - Global API prefix
 * - Winston logger
 *
 * Security Features:
 * - Helmet: Sets various HTTP headers for security
 * - CORS: Configured for specific origins
 * - Validation: Validates and sanitizes all incoming requests
 *
 * Documentation:
 * - Swagger UI available at /api/docs
 * - OpenAPI spec available at /api/docs-json
 *
 * @function bootstrap
 */
async function bootstrap() {
  // Create NestJS application instance with Winston logger
  // Winston is configured via winstonConfig for structured logging
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // Security Middleware: Helmet
  // Sets various HTTP headers to secure the application:
  // - X-Content-Type-Options: nosniff
  // - X-Frame-Options: DENY
  // - X-XSS-Protection: 1; mode=block
  // - Strict-Transport-Security (HSTS)
  // And many more security headers
  app.use(helmet());

  // Compression Middleware
  // Compresses response bodies to reduce bandwidth usage
  // Supports gzip and deflate compression algorithms
  app.use(compression());

  // Global Validation Pipe
  // Automatically validates all incoming request data
  // - whitelist: true - strips properties that don't have decorators
  // - forbidNonWhitelisted: true - throws error if non-whitelisted properties exist
  // - transform: true - automatically transforms payloads to DTO instances
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties without decorators
      forbidNonWhitelisted: true, // Throw error on non-whitelisted properties
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
    }),
  );

  // CORS Configuration
  // Controls which origins can access the API
  // Configured for development and production origins
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000', // Next.js frontend (development)
      'http://localhost:3100', // Alternative frontend port
      'http://127.0.0.1:3100', // Localhost alternative
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Correlation-ID', // For request tracing
    ],
    credentials: true, // Allow cookies and authentication headers
    preflightContinue: false, // Don't pass preflight requests to next handler
    optionsSuccessStatus: 204, // Return 204 for successful OPTIONS requests
  });

  // Swagger/OpenAPI Documentation Configuration
  // Generates interactive API documentation
  const config = new DocumentBuilder()
    .setTitle('PayrollX API Gateway')
    .setDescription(
      'API Gateway for PayrollX payroll system. Routes requests to appropriate microservices.',
    )
    .setVersion('1.0')
    .addBearerAuth() // Adds JWT Bearer token authentication to Swagger UI
    .addTag('Gateway', 'Routes requests to microservices')
    .addTag('Health', 'Health check endpoints')
    .build();

  // Create Swagger document and setup Swagger UI
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Persist authorization in Swagger UI
    },
  });

  // Global API Prefix
  // All routes will be prefixed with '/api'
  // Example: /health becomes /api/health
  app.setGlobalPrefix('api');

  // Start the application server
  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Log startup information
  // Note: Using console.log here because Winston might not be fully initialized
  console.log(`🚀 API Gateway running on port ${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  console.log(`🔍 Health check: http://localhost:${port}/api/health`);
}

// Execute bootstrap function
// Catch and log any errors during startup
bootstrap().catch((error) => {
  console.error('Failed to start API Gateway:', error);
  process.exit(1);
});
