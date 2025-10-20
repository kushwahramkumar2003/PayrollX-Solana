import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { createAuthDbConnection } from "@payrollx/database";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: ReturnType<typeof createAuthDbConnection>;

  constructor() {
    this.prisma = createAuthDbConnection();
  }

  get user() {
    return this.prisma.user;
  }

  get refreshToken() {
    return this.prisma.refreshToken;
  }

  get $queryRaw() {
    return this.prisma.$queryRaw.bind(this.prisma);
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
