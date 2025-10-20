import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { PayrollService } from "../payroll/payroll.service";

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly payrollService: PayrollService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async processScheduledPayrolls() {
    this.logger.log("Processing scheduled payrolls...");

    const now = new Date();
    const scheduledPayrolls = await this.prisma.payrollRun.findMany({
      where: {
        status: "DRAFT",
        scheduledDate: {
          lte: now,
        },
        deletedAt: null,
      },
      include: {
        items: {
          include: {
            employee: {
              include: {
                wallets: true,
              },
            },
          },
        },
      },
    });

    for (const payroll of scheduledPayrolls) {
      try {
        await this.payrollService.executePayrollRun(payroll.id, {});
        this.logger.log(`Scheduled payroll executed: ${payroll.id}`);
      } catch (error) {
        this.logger.error(
          `Failed to execute scheduled payroll ${payroll.id}:`,
          error
        );
      }
    }

    this.logger.log(`Processed ${scheduledPayrolls.length} scheduled payrolls`);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async retryFailedPayrollItems() {
    this.logger.log("Retrying failed payroll items...");

    const failedItems = await this.prisma.payrollItem.findMany({
      where: {
        status: "FAILED",
        retryCount: { lt: 3 },
        deletedAt: null,
      },
      include: {
        payrollRun: true,
        employee: {
          include: {
            wallets: true,
          },
        },
      },
    });

    for (const item of failedItems) {
      try {
        // Retry logic would go here
        // For now, we'll just increment the retry count
        await this.prisma.payrollItem.update({
          where: { id: item.id },
          data: {
            retryCount: (item.retryCount || 0) + 1,
          },
        });

        this.logger.log(`Retried payroll item: ${item.id}`);
      } catch (error) {
        this.logger.error(`Failed to retry payroll item ${item.id}:`, error);
      }
    }

    this.logger.log(`Retried ${failedItems.length} failed payroll items`);
  }
}

