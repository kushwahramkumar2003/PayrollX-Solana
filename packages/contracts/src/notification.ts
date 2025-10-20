import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export class CreateNotificationDto {
  @IsString()
  organizationId: string;

  @IsString()
  recipientId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  subject: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class NotificationResponseDto {
  id: string;
  organizationId: string;
  recipientId: string;
  type: NotificationType;
  subject: string;
  content: string;
  status: NotificationStatus;
  metadata?: Record<string, any>;
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
