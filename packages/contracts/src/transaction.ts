import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export class CreateTransactionDto {
  @IsString()
  organizationId: string;

  @IsOptional()
  @IsString()
  payrollRunId?: string;

  @IsOptional()
  @IsString()
  payrollItemId?: string;

  @IsEnum(['payroll', 'wallet_funding', 'token_swap', 'fee_payment'])
  transactionType: string;

  @IsString()
  fromAddress: string;

  @IsString()
  toAddress: string;

  @IsNumber()
  amount: number;

  @IsString()
  tokenMint: string;

  @IsString()
  signature: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsNumber()
  confirmationCount?: number;

  @IsOptional()
  @IsDateString()
  blockTime?: Date;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}

export class TransactionResponseDto {
  id: string;
  organizationId: string;
  payrollRunId?: string;
  payrollItemId?: string;
  transactionType: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  tokenMint: string;
  signature: string;
  status: TransactionStatus;
  confirmationCount: number;
  blockTime?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
