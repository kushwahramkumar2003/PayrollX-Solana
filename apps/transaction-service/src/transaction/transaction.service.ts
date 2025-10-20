import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SolanaService } from "./solana.service";

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly solanaService: SolanaService
  ) {}

  async findAll() {
    return this.prisma.transaction.findMany({
      include: {
        payrollRun: true,
        employee: true,
      },
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        payrollRun: true,
        employee: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async create(createTransactionDto: any) {
    const transaction = await this.prisma.transaction.create({
      data: createTransactionDto,
    });

    this.logger.log(`Transaction created: ${transaction.id}`);
    return transaction;
  }

  async execute(id: string) {
    const transaction = await this.findOne(id);

    if (transaction.status !== "PENDING") {
      throw new Error(`Transaction ${id} is not in PENDING status`);
    }

    try {
      // Update status to PROCESSING
      await this.prisma.transaction.update({
        where: { id },
        data: { status: "PROCESSING" },
      });

      // Execute on Solana
      const signature =
        await this.solanaService.executeTransaction(transaction);

      // Update status to COMPLETED
      await this.prisma.transaction.update({
        where: { id },
        data: {
          status: "COMPLETED",
          signature,
          completedAt: new Date(),
        },
      });

      this.logger.log(
        `Transaction executed successfully: ${id}, signature: ${signature}`
      );
      return { signature, status: "COMPLETED" };
    } catch (error) {
      // Update status to FAILED
      await this.prisma.transaction.update({
        where: { id },
        data: {
          status: "FAILED",
          error: error.message,
        },
      });

      this.logger.error(`Transaction execution failed: ${id}`, error);
      throw error;
    }
  }
}
