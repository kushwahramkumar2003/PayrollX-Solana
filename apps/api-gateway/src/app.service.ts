import { Injectable } from '@nestjs/common';

/**
 * Application Service
 *
 * Provides basic application-level functionality.
 * Currently provides a simple welcome message.
 *
 * @class AppService
 */
@Injectable()
export class AppService {
  /**
   * Returns a welcome message for the API Gateway.
   *
   * Used by the root endpoint to verify service is running.
   *
   * @returns Welcome message string
   */
  getHello(): string {
    return 'Hello World!';
  }
}
