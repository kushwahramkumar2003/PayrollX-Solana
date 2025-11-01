import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

/**
 * Gateway Module
 *
 * This module provides the API Gateway functionality for routing requests
 * to various microservices in the PayrollX system.
 *
 * Dependencies:
 * - HttpModule: Provides HTTP client functionality for proxying requests
 *
 * Exports:
 * - GatewayService: Service for proxying requests (can be used by other modules)
 * - GatewayController: Controller handling all gateway routes
 *
 * @module GatewayModule
 */
@Module({
  imports: [
    // HttpModule provides @nestjs/axios for making HTTP requests
    // Used by GatewayService to proxy requests to microservices
    HttpModule.register({
      timeout: 30000, // 30 second timeout for service requests
      maxRedirects: 5, // Maximum number of redirects to follow
    }),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService], // Export for potential use in other modules
})
export class GatewayModule {}
