import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    return this.prisma.auditLog.findMany({
      where: query,
      orderBy: { createdAt: "desc" },
      take: query.limit || 100,
      skip: query.offset || 0,
    });
  }

  async create(createAuditLogDto: any) {
    const auditLog = await this.prisma.auditLog.create({
      data: createAuditLogDto,
    });

    this.logger.log(`Audit log created: ${auditLog.id}`);
    return auditLog;
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}

