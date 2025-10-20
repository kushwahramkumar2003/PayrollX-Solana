import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import twilio from "twilio";

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client: twilio.Twilio;

  constructor(private readonly configService: ConfigService) {
    this.client = twilio(
      this.configService.get<string>("TWILIO_ACCOUNT_SID"),
      this.configService.get<string>("TWILIO_AUTH_TOKEN")
    );
  }

  async sendSms(notification: any) {
    try {
      const result = await this.client.messages.create({
        body: notification.content,
        from: this.configService.get<string>("TWILIO_PHONE_NUMBER"),
        to: notification.recipient,
      });

      this.logger.log(`SMS sent successfully: ${result.sid}`);
      return result;
    } catch (error) {
      this.logger.error("Error sending SMS:", error);
      throw error;
    }
  }
}
