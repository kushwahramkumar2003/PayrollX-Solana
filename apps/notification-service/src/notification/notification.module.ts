import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { EmailService } from "./email.service";
import { SmsService } from "./sms.service";

@Module({
  imports: [HttpModule],
  controllers: [NotificationController],
  providers: [NotificationService, EmailService, SmsService],
})
export class NotificationModule {}

