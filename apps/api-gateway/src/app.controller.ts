import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

/**
 * Application Root Controller
 *
 * Provides the root endpoint for the API Gateway service.
 * Used for basic service verification and welcome message.
 *
 * @class AppController
 */
@ApiTags('Root')
@Controller()
export class AppController {
  /**
   * Constructor injects the AppService.
   *
   * @param appService - Application service for basic operations
   */
  constructor(private readonly appService: AppService) {}

  /**
   * Root endpoint - returns a welcome message.
   *
   * Used to verify the service is running and accessible.
   *
   * @returns Welcome message string
   */
  @Get()
  @ApiOperation({
    summary: 'Root endpoint',
    description: 'Returns a welcome message for the API Gateway',
  })
  @ApiResponse({
    status: 200,
    description: 'Welcome message',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
