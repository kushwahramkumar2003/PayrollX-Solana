import { Injectable } from "@nestjs/common";

@Injectable()
export class HealthService {
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "transaction-service",
    };
  }

  ready() {
    return {
      status: "ready",
      timestamp: new Date().toISOString(),
      service: "transaction-service",
    };
  }

  live() {
    return {
      status: "alive",
      timestamp: new Date().toISOString(),
      service: "transaction-service",
    };
  }
}

