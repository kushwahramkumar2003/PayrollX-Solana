import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ComplianceController } from "./compliance.controller";
import { ComplianceService } from "./compliance.service";
import { AuditService } from "./audit.service";
import { ReportService } from "./report.service";

@Module({
  imports: [HttpModule],
  controllers: [ComplianceController],
  providers: [ComplianceService, AuditService, ReportService],
})
export class ComplianceModule {}

