import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private readonly serviceUrls: Record<string, string>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.serviceUrls = {
      auth:
        this.configService.get<string>('AUTH_SERVICE_URL') ||
        'http://localhost:3001',
      org:
        this.configService.get<string>('ORG_SERVICE_URL') ||
        'http://localhost:3002',
      employee:
        this.configService.get<string>('EMPLOYEE_SERVICE_URL') ||
        'http://localhost:3003',
      wallet:
        this.configService.get<string>('WALLET_SERVICE_URL') ||
        'http://localhost:3005',
      payroll:
        this.configService.get<string>('PAYROLL_SERVICE_URL') ||
        'http://localhost:3006',
      transaction:
        this.configService.get<string>('TRANSACTION_SERVICE_URL') ||
        'http://localhost:3007',
      notification:
        this.configService.get<string>('NOTIFICATION_SERVICE_URL') ||
        'http://localhost:3008',
      compliance:
        this.configService.get<string>('COMPLIANCE_SERVICE_URL') ||
        'http://localhost:3009',
    };
  }

  async proxyRequest(
    service: string,
    params: any,
    query: any,
    body?: any,
    method: string = 'GET',
  ) {
    const serviceUrl = this.serviceUrls[service];
    if (!serviceUrl) {
      throw new Error(`Unknown service: ${service}`);
    }

    try {
      // Extract the path after the service name
      const wildcardPath = params[0] || '';
      // Auth service uses /api/auth/* pattern, so prepend the service name
      const path = service === 'auth' ? `auth/${wildcardPath}` : wildcardPath;
      const url = `${serviceUrl}/api/${path}`;
      this.logger.log(`Proxying ${method} request to ${service} service: ${url}`);

      let response;
      switch (method.toUpperCase()) {
        case 'POST':
          response = await firstValueFrom(
            this.httpService.post(url, body, { params: query }),
          );
          break;
        case 'PUT':
          response = await firstValueFrom(
            this.httpService.put(url, body, { params: query }),
          );
          break;
        case 'DELETE':
          response = await firstValueFrom(
            this.httpService.delete(url, { params: query }),
          );
          break;
        default:
          response = await firstValueFrom(
            this.httpService.get(url, { params: query }),
          );
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Error proxying ${method} request to ${service}:`, error);
      throw error;
    }
  }
}

