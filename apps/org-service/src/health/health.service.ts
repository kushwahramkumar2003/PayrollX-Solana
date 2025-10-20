import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "org-service",
        version: process.env.npm_package_version || "1.0.0",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };
    } catch (error) {
      this.logger.error("Health check failed:", error);
      throw new Error("Service unhealthy");
    }
  }

  async ready() {
    try {
      // Check if service is ready to accept requests
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: "ready",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Readiness check failed:", error);
      throw new Error("Service not ready");
    }
  }

  async live() {
    // Simple liveness check
    return {
      status: "alive",
      timestamp: new Date().toISOString(),
    };
  }
}

