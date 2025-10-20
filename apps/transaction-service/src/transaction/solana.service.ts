import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  private readonly connection: Connection;
  private readonly program: Program;

  constructor(private readonly configService: ConfigService) {
    const rpcUrl =
      this.configService.get<string>("SOLANA_RPC_URL") ||
      "https://api.devnet.solana.com";
    this.connection = new Connection(rpcUrl, "confirmed");

    // Initialize Anchor program (would need actual IDL)
    // this.program = new Program(idl, provider);
  }

  async executeTransaction(transaction: any): Promise<string> {
    try {
      // Build Solana transaction
      const solanaTransaction = new Transaction();

      // Add instructions based on transaction type
      if (transaction.type === "PAYROLL") {
        // Add payroll instruction
        // This would use the actual Anchor program
      }

      // Sign and send transaction
      const signature = await this.connection.sendTransaction(
        solanaTransaction,
        []
      );

      // Wait for confirmation
      await this.connection.confirmTransaction(signature, "confirmed");

      this.logger.log(`Solana transaction executed: ${signature}`);
      return signature;
    } catch (error) {
      this.logger.error("Error executing Solana transaction:", error);
      throw error;
    }
  }

  async getTransactionStatus(signature: string) {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      return status;
    } catch (error) {
      this.logger.error(
        `Error getting transaction status for ${signature}:`,
        error
      );
      throw error;
    }
  }
}

