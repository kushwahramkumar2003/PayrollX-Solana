import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';

export enum TransactionType {
  PAYROLL = 'PAYROLL',
  BONUS = 'BONUS',
  REFUND = 'REFUND',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class CreateTransactionDto {
  @IsString()
  payrollRunId: string;

  @IsString()
  employeeId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  tokenAddress?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateTransactionDto {
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @IsString()
  @IsOptional()
  signature?: string;

  @IsString()
  @IsOptional()
  error?: string;

  @IsDateString()
  @IsOptional()
  completedAt?: string;
}

