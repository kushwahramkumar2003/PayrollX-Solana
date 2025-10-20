import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";

export interface BasePrismaClient {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $queryRaw: (query: TemplateStringsArray, ...values: any[]) => Promise<any>;
}

@Injectable()
export abstract class BasePrismaService
  implements OnModuleInit, OnModuleDestroy
{
  protected readonly logger = new Logger(this.constructor.name);
  protected abstract prisma: BasePrismaClient;

  async onModuleInit() {
    try {
      await this.prisma.$connect();
      this.logger.log("Database connected successfully");
    } catch (error) {
      this.logger.error("Database connection failed:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.prisma.$disconnect();
      this.logger.log("Database disconnected successfully");
    } catch (error) {
      this.logger.error("Database disconnection failed:", error);
      throw error;
    }
  }

  get $queryRaw() {
    return this.prisma.$queryRaw;
  }
}
