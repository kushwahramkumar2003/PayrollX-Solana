import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

/**
 * Swagger Aggregator Service
 *
 * This service fetches OpenAPI/Swagger specs from all microservices
 * and merges them into a single unified spec for the frontend.
 *
 * Responsibilities:
 * - Fetch OpenAPI specs from all registered services
 * - Merge multiple specs into one unified spec
 * - Handle errors gracefully (return empty specs for unavailable services)
 * - Cache the merged spec
 *
 * @class SwaggerAggregatorService
 */
@Injectable()
export class SwaggerAggregatorService {
  private readonly logger = new Logger(SwaggerAggregatorService.name);
  private readonly serviceUrls: Map<string, string>;
  private cachedSpec: any = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Initialize service URLs
    this.serviceUrls = new Map([
      ['auth', this.configService.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3001'],
      ['org', this.configService.get<string>('ORG_SERVICE_URL') || 'http://localhost:3002'],
      ['employee', this.configService.get<string>('EMPLOYEE_SERVICE_URL') || 'http://localhost:3003'],
      ['wallet', this.configService.get<string>('WALLET_SERVICE_URL') || 'http://localhost:3004'],
      ['payroll', this.configService.get<string>('PAYROLL_SERVICE_URL') || 'http://localhost:3005'],
      ['transaction', this.configService.get<string>('TRANSACTION_SERVICE_URL') || 'http://localhost:3006'],
      ['notification', this.configService.get<string>('NOTIFICATION_SERVICE_URL') || 'http://localhost:3007'],
      ['compliance', this.configService.get<string>('COMPLIANCE_SERVICE_URL') || 'http://localhost:3008'],
    ]);

    this.logger.log('Swagger Aggregator service initialized');
  }

  /**
   * Fetches OpenAPI spec from a single service
   */
  private async fetchServiceSpec(
    serviceName: string,
    serviceUrl: string,
  ): Promise<any> {
    const swaggerUrl = `${serviceUrl}/api/docs/json`;

    try {
      this.logger.debug(`Fetching OpenAPI spec from ${serviceName} at ${swaggerUrl}`);
      
      const response = await firstValueFrom(
        this.httpService.get(swaggerUrl, {
          timeout: 5000, // 5 second timeout
        }),
      );

      this.logger.debug(`Successfully fetched spec from ${serviceName}`);
      return response.data;
    } catch (error: any) {
      this.logger.warn(
        `Failed to fetch OpenAPI spec from ${serviceName}: ${error?.message || 'Unknown error'}`,
      );

      // Return empty spec instead of failing
      return {
        openapi: '3.0.0',
        info: {
          title: `${serviceName} Service`,
          version: '1.0',
          description: 'API temporarily unavailable',
        },
        paths: {},
        components: {},
      };
    }
  }

  /**
   * Merges multiple OpenAPI specs into one
   */
  private mergeSpecs(specs: Array<{ name: string; spec: any }>): any {
    const merged: any = {
      openapi: '3.0.0',
      info: {
        title: 'PayrollX Unified API',
        version: '1.0',
        description: 'Combined API for all PayrollX microservices',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'API Gateway',
        },
      ],
      paths: {},
      components: {
        schemas: {},
        parameters: {},
        responses: {},
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token authentication',
          },
        },
      },
      security: [{ bearerAuth: [] }],
      tags: [],
    };

    // Merge paths and components from each service
    specs.forEach(({ name, spec }) => {
      if (spec.paths) {
        Object.keys(spec.paths).forEach((path) => {
          // Add service tag to each path
          if (!merged.paths[path]) {
            merged.paths[path] = {};
          }
          Object.keys(spec.paths[path]).forEach((method) => {
            merged.paths[path][method] = {
              ...spec.paths[path][method],
              tags: [
                ...(spec.paths[path][method].tags || []),
                name.charAt(0).toUpperCase() + name.slice(1),
              ],
            };
          });
        });
      }

      if (spec.components) {
        if (spec.components.schemas) {
          Object.keys(spec.components.schemas).forEach((schema) => {
            merged.components.schemas[schema] = spec.components.schemas[schema];
          });
        }
        if (spec.components.parameters) {
          Object.keys(spec.components.parameters).forEach((param) => {
            merged.components.parameters[param] = spec.components.parameters[param];
          });
        }
        if (spec.components.responses) {
          Object.keys(spec.components.responses).forEach((response) => {
            merged.components.responses[response] = spec.components.responses[response];
          });
        }
      }

      if (spec.tags && Array.isArray(spec.tags)) {
        merged.tags.push(...spec.tags);
      }
    });

    // Deduplicate tags
    merged.tags = Array.from(
      new Set(merged.tags.map((tag: any) => tag.name || tag)),
    ).map((tag: any) => ({ name: tag }));

    return merged;
  }

  /**
   * Gets the merged OpenAPI spec (with caching)
   */
  async getMergedSpec(forceRefresh = false): Promise<any> {
    const now = Date.now();

    // Return cached spec if it's still valid
    if (
      !forceRefresh &&
      this.cachedSpec &&
      now - this.cacheTimestamp < this.CACHE_TTL
    ) {
      this.logger.debug('Returning cached OpenAPI spec');
      return this.cachedSpec;
    }

    this.logger.log('Fetching and merging OpenAPI specs from all services');

    // Fetch specs from all services in parallel
    const fetchPromises = Array.from(this.serviceUrls.entries()).map(
      ([serviceName, serviceUrl]) =>
        this.fetchServiceSpec(serviceName, serviceUrl).then((spec) => ({
          name: serviceName,
          spec,
        })),
    );

    const specs = await Promise.all(fetchPromises);

    // Merge specs
    const merged = this.mergeSpecs(specs);

    // Cache the result
    this.cachedSpec = merged;
    this.cacheTimestamp = now;

    this.logger.log('Successfully merged OpenAPI specs');
    return merged;
  }

  /**
   * Invalidates the cache
   */
  invalidateCache(): void {
    this.cachedSpec = null;
    this.cacheTimestamp = 0;
    this.logger.log('OpenAPI spec cache invalidated');
  }
}

