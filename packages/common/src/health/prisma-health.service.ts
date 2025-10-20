import { Injectable } from "@nestjs/common";
import { BaseHealthService } from "./base-health.service";

export interface PrismaClient {
  $queryRaw: (query: TemplateStringsArray, ...values: any[]) => Promise<any>;
}

@Injectable()
export class PrismaHealthService extends BaseHealthService {
  constructor(
    serviceName: string,
    private readonly prisma: PrismaClient
  ) {
    super(serviceName);
  }

  protected async performHealthCheck(): Promise<Record<string, any>> {
    // Check database connection
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      database: "connected",
    };
  }

  protected async performReadinessCheck(): Promise<void> {
    // Check if service is ready to accept requests
    await this.prisma.$queryRaw`SELECT 1`;
  }
}
