import { IsString, IsOptional, IsDateString, IsNumber, IsArray, IsEnum } from 'class-validator';

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class CreatePayrollRunDto {
  @IsString()
  organizationId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  payPeriodStart: string;

  @IsDateString()
  payPeriodEnd: string;

  @IsDateString()
  payDate: string;

  @IsArray()
  items: PayrollItemDto[];
}

export class PayrollItemDto {
  @IsString()
  employeeId: string;

  @IsNumber()
  grossAmount: number;

  @IsNumber()
  @IsOptional()
  deductions?: number;

  @IsNumber()
  @IsOptional()
  bonuses?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePayrollRunDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  payPeriodStart?: string;

  @IsDateString()
  @IsOptional()
  payPeriodEnd?: string;

  @IsDateString()
  @IsOptional()
  payDate?: string;

  @IsArray()
  @IsOptional()
  items?: PayrollItemDto[];

  @IsEnum(PayrollStatus)
  @IsOptional()
  status?: PayrollStatus;
}

