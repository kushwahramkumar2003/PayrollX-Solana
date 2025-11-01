import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  IsUUID,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * User roles in the PayrollX system
 */
export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ORG_ADMIN = "org_admin",
  HR_MANAGER = "hr_manager",
  EMPLOYEE = "employee",
}

/**
 * Login DTO
 *
 * Used for authenticating users. Only requires email and password.
 * Organization ID is optional for multi-tenant support.
 */
export class LoginDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
    type: String,
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email!: string;

  @ApiProperty({
    description: "User password",
    example: "SecurePassword123!",
    type: String,
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password!: string;

  @ApiPropertyOptional({
    description: "Organization ID for multi-tenant authentication",
    example: "123e4567-e89b-12d3-a456-426614174000",
    type: String,
  })
  @IsOptional()
  @IsUUID("4", { message: "Organization ID must be a valid UUID" })
  organizationId?: string;
}

/**
 * Register DTO
 *
 * Used for creating new user accounts.
 * All fields except organizationId are required.
 */
export class RegisterDto {
  @ApiProperty({
    description: "User email address (must be unique)",
    example: "user@example.com",
    type: String,
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email!: string;

  @ApiProperty({
    description: "User password (minimum 8 characters)",
    example: "SecurePassword123!",
    type: String,
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password!: string;

  @ApiProperty({
    description: "User first name",
    example: "John",
    type: String,
  })
  @IsString({ message: "First name must be a string" })
  firstName!: string;

  @ApiProperty({
    description: "User last name",
    example: "Doe",
    type: String,
  })
  @IsString({ message: "Last name must be a string" })
  lastName!: string;

  @ApiPropertyOptional({
    description: "Organization ID for multi-tenant support",
    example: "123e4567-e89b-12d3-a456-426614174000",
    type: String,
  })
  @IsOptional()
  @IsUUID("4", { message: "Organization ID must be a valid UUID" })
  organizationId?: string;
}

/**
 * Refresh Token DTO
 *
 * Used for refreshing access tokens using a refresh token.
 */
export class RefreshTokenDto {
  @ApiProperty({
    description: "Refresh token obtained from login",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    type: String,
  })
  @IsString({ message: "Refresh token must be a string" })
  refreshToken!: string;
}

/**
 * User DTO
 *
 * Represents a user entity returned in API responses.
 * Does not include sensitive information like password.
 */
export class UserDto {
  @ApiProperty({
    description: "User unique identifier",
    example: "123e4567-e89b-12d3-a456-426614174000",
    type: String,
  })
  id!: string;

  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
    type: String,
  })
  email!: string;

  @ApiProperty({
    description: "User first name",
    example: "John",
    type: String,
  })
  firstName!: string;

  @ApiProperty({
    description: "User last name",
    example: "Doe",
    type: String,
  })
  lastName!: string;

  @ApiProperty({
    description: "User role in the system",
    enum: UserRole,
    example: UserRole.EMPLOYEE,
  })
  role!: UserRole;

  @ApiPropertyOptional({
    description: "Organization ID the user belongs to",
    example: "123e4567-e89b-12d3-a456-426614174000",
    type: String,
  })
  organizationId?: string | null;

  @ApiProperty({
    description: "User account creation timestamp",
    example: "2024-01-15T10:30:00.000Z",
    type: Date,
  })
  createdAt!: Date;

  @ApiProperty({
    description: "User account last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
    type: Date,
  })
  updatedAt!: Date;
}

/**
 * Auth Response DTO
 *
 * Response returned after successful login or token refresh.
 * Contains access token, refresh token, and user information.
 */
export class AuthResponseDto {
  @ApiProperty({
    description: "JWT access token for API authentication",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    type: String,
  })
  accessToken!: string;

  @ApiProperty({
    description: "JWT refresh token for obtaining new access tokens",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    type: String,
  })
  refreshToken!: string;

  @ApiProperty({
    description: "User information",
    type: UserDto,
  })
  user!: UserDto;
}

/**
 * Logout Response DTO
 *
 * Response returned after successful logout.
 */
export class LogoutResponseDto {
  @ApiProperty({
    description: "Success message",
    example: "Logged out successfully",
    type: String,
  })
  message!: string;
}
