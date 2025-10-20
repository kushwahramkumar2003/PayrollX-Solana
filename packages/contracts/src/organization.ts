import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsBoolean,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { KycStatus } from "./employee";

export class CreateOrganizationDto {
  @ApiProperty({ description: "Organization name" })
  @IsString()
  name: string;

  @ApiProperty({ description: "Organization configuration", required: false })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class UpdateOrganizationDto {
  @ApiProperty({ description: "Organization name", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: "Organization configuration", required: false })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiProperty({ description: "Authorized signers", required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  authorizedSigners?: string[];

  @ApiProperty({ description: "Onboarding completed status", required: false })
  @IsOptional()
  @IsBoolean()
  onboardingCompleted?: boolean;
}

export class OrganizationResponseDto {
  @ApiProperty({ description: "Organization ID" })
  id: string;

  @ApiProperty({ description: "Organization name" })
  name: string;

  @ApiProperty({ description: "Organization configuration" })
  config: Record<string, any>;

  @ApiProperty({ description: "Authorized signers" })
  authorizedSigners: string[];

  @ApiProperty({ description: "Onboarding completed status" })
  onboardingCompleted: boolean;

  @ApiProperty({ description: "Created by user ID" })
  createdBy: string;

  @ApiProperty({ description: "Creation timestamp" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  updatedAt: Date;
}

export class EmployeeDto {
  @ApiProperty({ description: "Employee ID" })
  id: string;

  @ApiProperty({ description: "Organization ID" })
  organizationId: string;

  @ApiProperty({ description: "User ID" })
  userId: string;

  @ApiProperty({ description: "Wallet address", required: false })
  walletAddress?: string;

  @ApiProperty({ description: "KYC status" })
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
