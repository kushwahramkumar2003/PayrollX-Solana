import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreatePayrollRunDto,
  ExecutePayrollRunDto,
  PayrollStatus,
} from "@payrollx/contracts";
import { firstValueFrom } from "rxjs";

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);
  private readonly transactionServiceUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.transactionServiceUrl = this.configService.get(
      "TRANSACTION_SERVICE_URL",
      "http://localhost:3006"
    );
  }

  async createPayrollRun(
    createPayrollRunDto: CreatePayrollRunDto,
    createdBy: string
  ) {
    const { organizationId, scheduledDate, currency, items } =
      createPayrollRunDto;

    // Validate employees exist and are approved
    const employeeIds = items.map((item) => item.employeeId);
    const employees = await this.prisma.employee.findMany({
      where: {
        id: { in: employeeIds },
        organizationId,
        kycStatus: "APPROVED",
        deletedAt: null,
      },
      include: {
        wallets: true,
      },
    });

    if (employees.length !== employeeIds.length) {
      throw new BadRequestException(
        "Some employees are not found or not approved for payroll"
      );
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    // Create payroll run
    const payrollRun = await this.prisma.payrollRun.create({
      data: {
        organizationId,
        status: PayrollStatus.DRAFT,
        scheduledDate: new Date(scheduledDate),
        totalAmount,
        currency,
        createdBy,
        items: {
          create: items.map((item) => ({
            employeeId: item.employeeId,
            amount: item.amount,
            status: PayrollStatus.DRAFT,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    this.logger.log(`Payroll run created: ${payrollRun.id}`);

    return payrollRun;
  }

  async getPayrollRun(id: string) {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id, deletedAt: null },
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

    if (!payrollRun) {
      throw new NotFoundException("Payroll run not found");
    }

    return payrollRun;
  }

  async getPayrollRuns(organizationId: string) {
    return this.prisma.payrollRun.findMany({
      where: { organizationId, deletedAt: null },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async executePayrollRun(
    id: string,
    executePayrollRunDto: ExecutePayrollRunDto
  ) {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id, deletedAt: null },
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

    if (!payrollRun) {
      throw new NotFoundException("Payroll run not found");
    }

    if (payrollRun.status !== PayrollStatus.DRAFT) {
      throw new BadRequestException(
        "Payroll run cannot be executed in current status"
      );
    }

    // Update status to PENDING
    await this.prisma.payrollRun.update({
      where: { id },
      data: { status: PayrollStatus.PENDING },
    });

    try {
      // Emit event to transaction service
      await this.emitEvent("PayrollInitiated", {
        payrollRunId: payrollRun.id,
        organizationId: payrollRun.organizationId,
        totalAmount: payrollRun.totalAmount,
        currency: payrollRun.currency,
        items: payrollRun.items.map((item) => ({
          employeeId: item.employeeId,
          amount: item.amount,
          walletAddress: item.employee.wallets[0]?.publicKey,
        })),
      });

      this.logger.log(`Payroll run initiated: ${id}`);

      return {
        id: payrollRun.id,
        status: PayrollStatus.PENDING,
        message: "Payroll run initiated successfully",
      };
    } catch (error) {
      // Revert status on error
      await this.prisma.payrollRun.update({
        where: { id },
        data: { status: PayrollStatus.DRAFT },
      });

      this.logger.error(`Failed to initiate payroll run ${id}:`, error);
      throw error;
    }
  }

  async updatePayrollItemStatus(
    itemId: string,
    status: PayrollStatus,
    txSignature?: string
  ) {
    await this.prisma.payrollItem.update({
      where: { id: itemId },
      data: {
        status,
        txSignature,
      },
    });

    // Check if all items are completed
    const payrollItem = await this.prisma.payrollItem.findUnique({
      where: { id: itemId },
      include: { payrollRun: true },
    });

    if (payrollItem) {
      const allItems = await this.prisma.payrollItem.findMany({
        where: { payrollRunId: payrollItem.payrollRunId },
      });

      const allCompleted = allItems.every(
        (item) =>
          item.status === PayrollStatus.COMPLETED ||
          item.status === PayrollStatus.FAILED
      );

      if (allCompleted) {
        const completedCount = allItems.filter(
          (item) => item.status === PayrollStatus.COMPLETED
        ).length;
        const finalStatus =
          completedCount === allItems.length
            ? PayrollStatus.COMPLETED
            : PayrollStatus.FAILED;

        await this.prisma.payrollRun.update({
          where: { id: payrollItem.payrollRunId },
          data: { status: finalStatus },
        });

        // Emit completion event
        await this.emitEvent("PayrollCompleted", {
          payrollRunId: payrollItem.payrollRunId,
          status: finalStatus,
          completedItems: completedCount,
          totalItems: allItems.length,
        });
      }
    }
  }

  private async emitEvent(eventType: string, data: any) {
    // This would emit events to RabbitMQ
    // For now, we'll just log the event
    this.logger.log(`Event emitted: ${eventType}`, data);
  }
}

