import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "./email.service";
import { SmsService } from "./sms.service";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService
  ) {}

  async findAll() {
    return this.prisma.notification.findMany({
      include: {
        user: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async create(createNotificationDto: any) {
    const notification = await this.prisma.notification.create({
      data: createNotificationDto,
    });

    this.logger.log(`Notification created: ${notification.id}`);
    return notification;
  }

  async send(id: string) {
    const notification = await this.findOne(id);

    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    try {
      // Update status to SENDING
      await this.prisma.notification.update({
        where: { id },
        data: { status: "SENDING" },
      });

      // Send notification based on type
      let result;
      switch (notification.type) {
        case "EMAIL":
          result = await this.emailService.sendEmail(notification);
          break;
        case "SMS":
          result = await this.smsService.sendSms(notification);
          break;
        default:
          throw new Error(
            `Unsupported notification type: ${notification.type}`
          );
      }

      // Update status to SENT
      await this.prisma.notification.update({
        where: { id },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });

      this.logger.log(`Notification sent successfully: ${id}`);
      return result;
    } catch (error) {
      // Update status to FAILED
      await this.prisma.notification.update({
        where: { id },
        data: {
          status: "FAILED",
          error: error.message,
        },
      });

      this.logger.error(`Notification sending failed: ${id}`, error);
      throw error;
    }
  }
}

