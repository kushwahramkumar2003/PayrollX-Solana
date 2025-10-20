import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ComplianceService } from "./compliance.service";

@ApiTags("Compliance")
@Controller("compliance")
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get("audit-logs")
  @ApiOperation({ summary: "Get audit logs" })
  @ApiResponse({
    status: 200,
    description: "Audit logs retrieved successfully",
  })
  async getAuditLogs(@Query() query: any) {
    return this.complianceService.getAuditLogs(query);
  }

  @Get("reports")
  @ApiOperation({ summary: "Get compliance reports" })
  @ApiResponse({ status: 200, description: "Reports retrieved successfully" })
  async getReports(@Query() query: any) {
    return this.complianceService.getReports(query);
  }

  @Post("audit-logs")
  @ApiOperation({ summary: "Create audit log entry" })
  @ApiResponse({ status: 201, description: "Audit log created successfully" })
  async createAuditLog(@Body() createAuditLogDto: any) {
    return this.complianceService.createAuditLog(createAuditLogDto);
  }

  @Post("reports/generate")
  @ApiOperation({ summary: "Generate compliance report" })
  @ApiResponse({ status: 200, description: "Report generated successfully" })
  async generateReport(@Body() generateReportDto: any) {
    return this.complianceService.generateReport(generateReportDto);
  }

  @Get("reports/:id/download")
  @ApiOperation({ summary: "Download compliance report" })
  @ApiResponse({ status: 200, description: "Report downloaded successfully" })
  async downloadReport(@Param("id") id: string) {
    return this.complianceService.downloadReport(id);
  }
}

