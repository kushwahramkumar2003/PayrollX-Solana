import { IsString, IsOptional, IsDateString, IsUUID } from "class-validator";

export class BaseEntity {
  @IsUUID()
  id!: string;

  @IsDateString()
  createdAt!: Date;

  @IsDateString()
  updatedAt!: Date;
}

export class PaginationDto {
  @IsOptional()
  @IsString()
  page?: string = "1";

  @IsOptional()
  @IsString()
  limit?: string = "10";

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "asc";
}

export class ApiResponse<T> {
  success!: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp!: string;
}

export class PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
