import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";
import * as csvWriter from "csv-writer";
import PDFDocument from "pdfkit";

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  private readonly exportPath: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    this.exportPath =
      this.configService.get<string>("REPORT_EXPORT_PATH") || "./exports";
    this.ensureExportDirectory();
  }

  private ensureExportDirectory() {
    if (!fs.existsSync(this.exportPath)) {
      fs.mkdirSync(this.exportPath, { recursive: true });
    }
  }

  async findAll(query: any) {
    return this.prisma.complianceReport.findMany({
      where: query,
      orderBy: { createdAt: "desc" },
    });
  }

  async generate(generateReportDto: any) {
    const report = await this.prisma.complianceReport.create({
      data: {
        ...generateReportDto,
        status: "GENERATING",
      },
    });

    try {
      let filePath: string;

      switch (generateReportDto.format) {
        case "CSV":
          filePath = await this.generateCsvReport(report);
          break;
        case "PDF":
          filePath = await this.generatePdfReport(report);
          break;
        default:
          throw new Error(
            `Unsupported report format: ${generateReportDto.format}`
          );
      }

      // Update report with file path
      await this.prisma.complianceReport.update({
        where: { id: report.id },
        data: {
          status: "COMPLETED",
          filePath,
          completedAt: new Date(),
        },
      });

      this.logger.log(`Report generated successfully: ${report.id}`);
      return { ...report, filePath };
    } catch (error) {
      // Update report status to failed
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : String(error);

      await this.prisma.complianceReport.update({
        where: { id: report.id },
        data: {
          status: "FAILED",
          error: errorMessage,
        },
      });

      this.logger.error(`Report generation failed: ${report.id}`, error);
      throw error;
    }
  }

  private async generateCsvReport(report: any): Promise<string> {
    const fileName = `report_${report.id}_${Date.now()}.csv`;
    const filePath = path.join(this.exportPath, fileName);

    const writer = csvWriter.createObjectCsvWriter({
      path: filePath,
      header: [
        { id: "timestamp", title: "Timestamp" },
        { id: "action", title: "Action" },
        { id: "entityType", title: "Entity Type" },
        { id: "entityId", title: "Entity ID" },
        { id: "userId", title: "User ID" },
        { id: "details", title: "Details" },
      ],
    });

    // Get audit logs for the report
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: report.startDate,
          lte: report.endDate,
        },
      },
    });

    await writer.writeRecords(auditLogs);
    return filePath;
  }

  private async generatePdfReport(report: any): Promise<string> {
    const fileName = `report_${report.id}_${Date.now()}.pdf`;
    const filePath = path.join(this.exportPath, fileName);

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text("Compliance Report", 100, 100);
    doc.fontSize(12).text(`Report ID: ${report.id}`, 100, 150);
    doc.text(`Generated: ${new Date().toISOString()}`, 100, 170);

    // Add audit logs data
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: report.startDate,
          lte: report.endDate,
        },
      },
    });

    let yPosition = 220;
    auditLogs.forEach((log) => {
      doc.text(
        `${log.createdAt}: ${log.action} - ${log.entityType}`,
        100,
        yPosition
      );
      yPosition += 20;
    });

    doc.end();
    return filePath;
  }

  async download(id: string) {
    const report = await this.prisma.complianceReport.findUnique({
      where: { id },
    });

    if (!report || report.status !== "COMPLETED") {
      throw new Error(`Report ${id} not found or not completed`);
    }

    return {
      filePath: report.filePath,
      fileName: path.basename(report.filePath),
    };
  }
}
