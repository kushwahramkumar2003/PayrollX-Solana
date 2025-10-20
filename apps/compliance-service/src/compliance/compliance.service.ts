import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "./audit.service";
import { ReportService } from "./report.service";

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly reportService: ReportService
  ) {}

  async getAuditLogs(query: any) {
    return this.auditService.findAll(query);
  }

  async getReports(query: any) {
    return this.reportService.findAll(query);
  }

  async createAuditLog(createAuditLogDto: any) {
    return this.auditService.create(createAuditLogDto);
  }

  async generateReport(generateReportDto: any) {
    return this.reportService.generate(generateReportDto);
  }

  async downloadReport(id: string) {
    return this.reportService.download(id);
  }
}

