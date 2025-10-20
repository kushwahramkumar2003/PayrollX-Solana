import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsEnum,
  IsArray,
  IsDateString,
  ValidateNested,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export enum PayrollStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export class PayrollItemDto {
  @ApiProperty({ description: "Employee ID" })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ description: "Amount to pay" })
  @IsNumber()
  amount: number;
}

export class CreatePayrollRunDto {
  @ApiProperty({ description: "Organization ID" })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ description: "Scheduled date for payroll execution" })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ description: "Currency for payroll" })
  @IsString()
  currency: string;

  @ApiProperty({ description: "Payroll items", type: [PayrollItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayrollItemDto)
  items: PayrollItemDto[];
}

export class ExecutePayrollRunDto {
  @ApiProperty({
    description: "Force execution even if conditions are not met",
    required: false,
  })
  @IsOptional()
  @IsString()
  force?: string;
}

export class PayrollItemResponseDto {
  @ApiProperty({ description: "Payroll item ID" })
  id: string;

  @ApiProperty({ description: "Payroll run ID" })
  payrollRunId: string;

  @ApiProperty({ description: "Employee ID" })
  employeeId: string;

  @ApiProperty({ description: "Amount" })
  amount: number;

  @ApiProperty({ description: "Item status", enum: PayrollStatus })
  status: PayrollStatus;

  @ApiProperty({ description: "Transaction signature", required: false })
  txSignature?: string;

  @ApiProperty({ description: "Retry count" })
  retryCount: number;

  @ApiProperty({ description: "Creation timestamp" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  updatedAt: Date;
}

export class PayrollRunResponseDto {
  @ApiProperty({ description: "Payroll run ID" })
  id: string;

  @ApiProperty({ description: "Organization ID" })
  organizationId: string;

  @ApiProperty({ description: "Payroll status", enum: PayrollStatus })
  status: PayrollStatus;

  @ApiProperty({ description: "Scheduled date" })
  scheduledDate: Date;

  @ApiProperty({ description: "Total amount" })
  totalAmount: number;

  @ApiProperty({ description: "Currency" })
  currency: string;

  @ApiProperty({ description: "Created by user ID" })
  createdBy: string;

  @ApiProperty({ description: "Creation timestamp" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  updatedAt: Date;

  @ApiProperty({ description: "Payroll items" })
  items: PayrollItemResponseDto[];
}
