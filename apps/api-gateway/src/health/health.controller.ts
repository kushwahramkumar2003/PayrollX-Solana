import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';

/**
 * Health Check Controller
 *
 * Provides health check endpoints for monitoring and orchestration systems.
 *
 * Endpoints:
 * - GET /api/health - Returns the health status of the API Gateway service
 *
 * The health check verifies:
 * - Service is running and responding
 * - Dependencies are available (if configured)
 *
 * Used by:
 * - Kubernetes liveness and readiness probes
 * - Docker health checks
 * - Monitoring systems (Prometheus, etc.)
 * - Load balancers for service discovery
 *
 * @class HealthController
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  /**
   * Constructor injects the HealthCheckService from @nestjs/terminus.
   *
   * @param health - Health check service for performing health checks
   */
  constructor(private health: HealthCheckService) {}

  /**
   * Health check endpoint
   *
   * Returns the health status of the API Gateway service.
   * Currently performs basic health check - can be extended to check
   * connectivity to microservices or other dependencies.
   *
   * @returns Health check result object
   */
  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the health status of the API Gateway service',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: { type: 'object' },
        error: { type: 'object' },
        details: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Service is unhealthy',
  })
  check() {
    // Perform health checks
    // Empty array means only basic health check (service is running)
    // Can add specific health indicators here:
    // - MemoryHealthIndicator, MemoryHealthIndicator
    // - DiskHealthIndicator
    // - MicroserviceHealthIndicator (to check downstream services)
    return this.health.check([]);
  }
}
