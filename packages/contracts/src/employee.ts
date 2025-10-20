import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum KycStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export class CreateEmployeeDto {
  @ApiProperty({ description: "Organization ID" })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ description: "User ID" })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: "Salary amount", required: false })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty({ description: "Payment token", required: false })
  @IsOptional()
  @IsString()
  paymentToken?: string;
}

export class UpdateEmployeeDto {
  @ApiProperty({ description: "Salary amount", required: false })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty({ description: "Payment token", required: false })
  @IsOptional()
  @IsString()
  paymentToken?: string;

  @ApiProperty({ description: "KYC status", required: false, enum: KycStatus })
  @IsOptional()
  @IsEnum(KycStatus)
  kycStatus?: KycStatus;
}

export class LinkWalletDto {
  @ApiProperty({ description: "Solana wallet address" })
  @IsString()
  walletAddress: string;
}

export class KycDocumentDto {
  @ApiProperty({ description: "Document type" })
  @IsString()
  documentType: string;

  @ApiProperty({ description: "Document description", required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class EmployeeResponseDto {
  @ApiProperty({ description: "Employee ID" })
  id: string;

  @ApiProperty({ description: "Organization ID" })
  organizationId: string;

  @ApiProperty({ description: "User ID" })
  userId: string;

  @ApiProperty({ description: "Wallet address", required: false })
  walletAddress?: string;

  @ApiProperty({ description: "KYC status", enum: KycStatus })
  kycStatus: KycStatus;

  @ApiProperty({ description: "KYC documents", required: false })
  kycDocuments?: Record<string, any>;

  @ApiProperty({ description: "Salary", required: false })
  salary?: number;

  @ApiProperty({ description: "Payment token", required: false })
  paymentToken?: string;

  @ApiProperty({ description: "Creation timestamp" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  updatedAt: Date;
}
