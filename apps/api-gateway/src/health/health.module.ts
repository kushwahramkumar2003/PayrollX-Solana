import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';

/**
 * Health Module
 *
 * This module provides health check functionality for the API Gateway service.
 *
 * Dependencies:
 * - TerminusModule: Provides health check utilities from @nestjs/terminus
 * - HttpModule: Used for checking connectivity to downstream services (if needed)
 *
 * Components:
 * - HealthController: Exposes health check endpoints
 *
 * @module HealthModule
 */
@Module({
  imports: [
    // TerminusModule provides health check functionality
    // Used for Kubernetes liveness/readiness probes and monitoring
    TerminusModule,
    // HttpModule can be used to check connectivity to microservices
    HttpModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
