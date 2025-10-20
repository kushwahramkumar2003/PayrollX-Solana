import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export enum WalletProvider {
  MPC = 'MPC',
  SOLANA = 'SOLANA',
}

export class GenerateWalletDto {
  @IsString()
  employeeId: string;

  @IsNumber()
  @IsOptional()
  participantCount?: number;
}

export class SignTransactionDto {
  @IsString()
  transactionData: string;
}

export class GetBalanceDto {
  @IsString()
  @IsOptional()
  tokenAddress?: string;
}

export class WalletResponseDto {
  @IsString()
  id: string;

  @IsString()
  publicKey: string;

  @IsString()
  @IsOptional()
  walletId?: string;

  @IsString()
  @IsOptional()
  shareIds?: string[];

  @IsNumber()
  @IsOptional()
  threshold?: number;
}

