import { Controller, Get, Header } from '@nestjs/common';
import { SwaggerAggregatorService } from './swagger-aggregator.service';

/**
 * Swagger Aggregator Controller
 *
 * Exposes endpoints for accessing the merged OpenAPI spec
 *
 * @class SwaggerAggregatorController
 */
@Controller()
export class SwaggerAggregatorController {
  constructor(
    private readonly swaggerAggregatorService: SwaggerAggregatorService,
  ) {}

  /**
   * Returns the merged OpenAPI spec as JSON
   * This endpoint provides the aggregated spec from all microservices
   */
  @Get('docs/unified')
  @Header('Content-Type', 'application/json')
  async getMergedSpec() {
    return this.swaggerAggregatorService.getMergedSpec();
  }
}

