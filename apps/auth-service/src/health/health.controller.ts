import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { HealthCheckService, HealthCheck } from "@nestjs/terminus";
import { HealthService } from "./health.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private healthService: HealthService
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: "Health check" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  check() {
    return this.health.check([() => this.healthService.isHealthy("database")]);
  }
}
