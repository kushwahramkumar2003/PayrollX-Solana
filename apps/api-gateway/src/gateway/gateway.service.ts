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

  async proxyRequest(service: string, params: any, query: any) {
    const serviceUrl = this.serviceUrls[service];
    if (!serviceUrl) {
      throw new Error(`Unknown service: ${service}`);
    }

    try {
      const url = `${serviceUrl}/api/${service}`;
      this.logger.log(`Proxying request to ${service} service: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, { params: query }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error proxying request to ${service}:`, error);
      throw error;
    }
  }
}

