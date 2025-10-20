import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { PrismaService } from "../prisma/prisma.service";
import {
  GenerateWalletDto,
  SignTransactionDto,
  GetBalanceDto,
} from "@payrollx/contracts";
import { MpcClient } from "../clients/mpc-client";

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private readonly mpcClient: MpcClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.mpcClient = new MpcClient();
  }

  async generateWallet(generateWalletDto: GenerateWalletDto, userId: string) {
    const { employeeId, participantCount } = generateWalletDto;

    try {
      // Call MPC server to generate keys
      const keygenResponse = await this.mpcClient.generateWallet(
        2, // threshold
        participantCount || 3 // total shares
      );

      const { wallet_id, public_key, share_ids, threshold } = keygenResponse;

      // Store wallet in database
      const wallet = await this.prisma.wallet.create({
        data: {
          employeeId,
          publicKey: public_key,
          keyShareIds: share_ids,
          provider: "mpc",
          createdBy: userId,
        },
      });

      this.logger.log(`Wallet generated: ${wallet.id}`);

      return {
        id: wallet.id,
        publicKey: wallet.publicKey,
        walletId: wallet_id,
        shareIds: share_ids,
        threshold,
        createdAt: wallet.createdAt,
      };
    } catch (error) {
      this.logger.error("Failed to generate wallet:", error);
      throw new HttpException(
        "Failed to generate wallet",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id, deletedAt: null },
      include: {
        employee: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }

    return wallet;
  }

  async signTransaction(
    walletId: string,
    signTransactionDto: SignTransactionDto
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId, deletedAt: null },
    });

    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }

    try {
      // Create transaction data from DTO
      const transactionData = JSON.stringify(signTransactionDto);

      // Call MPC server to sign transaction
      const signature = await this.mpcClient.signTransaction(
        walletId,
        Buffer.from(transactionData, "utf8"),
        wallet.keyShareIds.slice(0, 2) // Use first 2 shares for threshold
      );

      this.logger.log(`Transaction signed for wallet: ${walletId}`);

      return {
        signature,
        publicKey: wallet.publicKey,
        walletId,
        signedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to sign transaction:", error);
      throw new HttpException(
        "Failed to sign transaction",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getBalance(walletId: string, getBalanceDto: GetBalanceDto) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId, deletedAt: null },
    });

    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }

    try {
      // In a real implementation, this would query the Solana blockchain
      // For now, return a mock response
      return {
        walletId,
        address: wallet.publicKey,
        balance: "1000000000", // 1 SOL in lamports
        lamports: 1000000000,
        sol: "1.0",
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to get balance:", error);
      throw new HttpException(
        "Failed to get balance",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
