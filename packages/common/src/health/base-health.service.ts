import { Injectable, Logger } from "@nestjs/common";
import { HealthIndicatorResult, HealthIndicatorStatus } from "@nestjs/terminus";

@Injectable()
export abstract class BaseHealthService {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly serviceName: string) {}

  async check(): Promise<Record<string, any>> {
    try {
      const healthData = await this.performHealthCheck();

      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        service: this.serviceName,
        version: process.env.npm_package_version || "1.0.0",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        ...healthData,
      };
    } catch (error) {
      this.logger.error("Health check failed:", error);
      throw new Error("Service unhealthy");
    }
  }

  async ready(): Promise<{ status: string; timestamp: string }> {
    try {
      await this.performReadinessCheck();

      return {
        status: "ready",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Readiness check failed:", error);
      throw new Error("Service not ready");
    }
  }

  async live(): Promise<{ status: string; timestamp: string }> {
    return {
      status: "alive",
      timestamp: new Date().toISOString(),
    };
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.performHealthCheck();
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

  protected abstract performHealthCheck(): Promise<Record<string, any>>;
  protected abstract performReadinessCheck(): Promise<void>;
}
