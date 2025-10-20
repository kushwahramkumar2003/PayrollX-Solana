import { registerAs } from "@nestjs/config";

export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigins: string[];
  logLevel: string;
}

export const appConfig = registerAs(
  "app",
  (): AppConfig => ({
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    corsOrigins: process.env.CORS_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    logLevel: process.env.LOG_LEVEL || "info",
  })
);

export interface DatabaseConfig {
  url: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export const databaseConfig = registerAs(
  "database",
  (): DatabaseConfig => ({
    url:
      process.env.DATABASE_URL ||
      "postgresql://admin:password@localhost:5432/payrollx",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USERNAME || "admin",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "payrollx",
  })
);

export interface RedisConfig {
  url: string;
  host: string;
  port: number;
  password?: string;
}

export const redisConfig = registerAs(
  "redis",
  (): RedisConfig => ({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
  })
);

export interface RabbitMQConfig {
  url: string;
  host: string;
  port: number;
  username: string;
  password: string;
}

export const rabbitMQConfig = registerAs(
  "rabbitmq",
  (): RabbitMQConfig => ({
    url: process.env.RABBITMQ_URL || "amqp://admin:password@localhost:5672",
    host: process.env.RABBITMQ_HOST || "localhost",
    port: parseInt(process.env.RABBITMQ_PORT || "5672", 10),
    username: process.env.RABBITMQ_USERNAME || "admin",
    password: process.env.RABBITMQ_PASSWORD || "password",
  })
);
