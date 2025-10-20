import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("SMTP_HOST"),
      port: this.configService.get<number>("SMTP_PORT"),
      secure: false,
      auth: {
        user: this.configService.get<string>("SMTP_USER"),
        pass: this.configService.get<string>("SMTP_PASS"),
      },
    });
  }

  async sendEmail(notification: any) {
    try {
      const mailOptions = {
        from: this.configService.get<string>("SMTP_FROM"),
        to: notification.recipient,
        subject: notification.subject,
        text: notification.content,
        html: notification.content,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully: ${result.messageId}`);
      return result;
    } catch (error) {
      this.logger.error("Error sending email:", error);
      throw error;
    }
  }
}
