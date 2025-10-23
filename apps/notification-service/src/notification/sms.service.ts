import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import twilio from "twilio";

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client: twilio.Twilio;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>("TWILIO_ACCOUNT_SID");
    const authToken = this.configService.get<string>("TWILIO_AUTH_TOKEN");

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    } else {
      this.logger.warn(
        "Twilio credentials not provided. SMS service will be disabled."
      );
      this.client = null as any;
    }
  }

  async sendSms(notification: any) {
    try {
      if (!this.client) {
        this.logger.warn("SMS service is disabled. Skipping SMS send.");
        return { sid: "disabled", status: "skipped" };
      }

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
