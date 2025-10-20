import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
} from "class-validator";

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ORG_ADMIN = "org_admin",
  HR_MANAGER = "hr_manager",
  EMPLOYEE = "employee",
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  organizationId?: string;
}

export class AuthResponse {
  accessToken!: string;
  refreshToken!: string;
  user!: UserDto;
}

export class UserDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  role!: UserRole;
  organizationId?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}
