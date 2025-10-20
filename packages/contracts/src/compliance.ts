import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING_REVIEW = 'pending_review',
  UNDER_INVESTIGATION = 'under_investigation',
}

export class CreateAuditLogDto {
  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  action: string;

  @IsString()
  resource: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsObject()
  details: Record<string, any>;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class AuditLogResponseDto {
  id: string;
  organizationId?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export class ComplianceReportDto {
  @IsString()
  organizationId: string;

  @IsEnum(ComplianceStatus)
  status: ComplianceStatus;

  @IsString()
  reportType: string;

  @IsObject()
  findings: Record<string, any>;

  @IsOptional()
  @IsString()
  recommendations?: string;
}
