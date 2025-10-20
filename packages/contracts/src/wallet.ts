import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsArray,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GenerateWalletDto {
  @ApiProperty({ description: "Employee ID" })
  @IsUUID()
  employeeId: string;

  @ApiProperty({
    description: "Number of participants for MPC",
    required: false,
    default: 3,
  })
  @IsOptional()
  @IsNumber()
  participantCount?: number;
}

export class SignTransactionDto {
  @ApiProperty({ description: "Recipient address" })
  @IsString()
  toAddress: string;

  @ApiProperty({ description: "Amount in lamports" })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: "Transaction memo", required: false })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({ description: "Recent block hash" })
  @IsString()
  recentBlockHash: string;
}

export class GetBalanceDto {
  @ApiProperty({ description: "Wallet address", required: false })
  @IsOptional()
  @IsString()
  address?: string;
}

export class WalletResponseDto {
  @ApiProperty({ description: "Wallet ID" })
  id: string;

  @ApiProperty({ description: "Employee ID" })
  employeeId: string;

  @ApiProperty({ description: "Public key" })
  publicKey: string;

  @ApiProperty({ description: "Key share IDs" })
  keyShareIds: string[];

  @ApiProperty({ description: "Provider" })
  provider: string;

  @ApiProperty({ description: "Created by user ID" })
  createdBy: string;

  @ApiProperty({ description: "Creation timestamp" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  updatedAt: Date;
}

export class SignTransactionResponseDto {
  @ApiProperty({ description: "Transaction signature" })
  signature: string;

  @ApiProperty({ description: "Transaction ID" })
  transactionId: string;

  @ApiProperty({ description: "Wallet ID" })
  walletId: string;

  @ApiProperty({ description: "Signing timestamp" })
  signedAt: string;
}

export class BalanceResponseDto {
  @ApiProperty({ description: "Wallet ID" })
  walletId: string;

  @ApiProperty({ description: "Wallet address" })
  address: string;

  @ApiProperty({ description: "Balance in lamports" })
  balance: number;

  @ApiProperty({ description: "Balance in lamports" })
  lamports: number;

  @ApiProperty({ description: "Balance in SOL" })
  sol: number;

  @ApiProperty({ description: "Balance check timestamp" })
  checkedAt: string;
}
