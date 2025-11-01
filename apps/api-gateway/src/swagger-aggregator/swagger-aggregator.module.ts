import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SwaggerAggregatorController } from './swagger-aggregator.controller';
import { SwaggerAggregatorService } from './swagger-aggregator.service';

/**
 * Swagger Aggregator Module
 *
 * Provides functionality to aggregate OpenAPI specs from all microservices
 *
 * @module SwaggerAggregatorModule
 */
@Module({
  imports: [
    HttpModule.register({
      timeout: 10000, // 10 second timeout for fetching specs
      maxRedirects: 5,
    }),
  ],
  controllers: [SwaggerAggregatorController],
  providers: [SwaggerAggregatorService],
  exports: [SwaggerAggregatorService],
})
export class SwaggerAggregatorModule {}

