import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  EXECUTE = 'EXECUTE',
}

export enum ReportFormat {
  CSV = 'CSV',
  PDF = 'PDF',
  JSON = 'JSON',
}

export enum ReportStatus {
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class CreateAuditLogDto {
  @IsString()
  userId: string;

  @IsEnum(AuditAction)
  action: AuditAction;

  @IsString()
  entityType: string;

  @IsString()
  entityId: string;

  @IsString()
  @IsOptional()
  details?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}

export class GenerateReportDto {
  @IsString()
  name: string;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsOptional()
  filters?: string;

  @IsString()
  @IsOptional()
  organizationId?: string;
}

