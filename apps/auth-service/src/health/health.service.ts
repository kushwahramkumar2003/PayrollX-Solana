import { Injectable } from "@nestjs/common";
import { HealthIndicatorResult, HealthIndicatorStatus } from "@nestjs/terminus";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        [key]: {
          status: "up" as HealthIndicatorStatus,
        },
      };
    } catch (error) {
      return {
        [key]: {
          status: "down" as HealthIndicatorStatus,
          message: error.message,
        },
      };
    }
  }

  getHealthStatus() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "auth-service",
    };
  }
}
