import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TransactionController } from "./transaction.controller";
import { TransactionService } from "./transaction.service";
import { SolanaService } from "./solana.service";

@Module({
  imports: [HttpModule],
  controllers: [TransactionController],
  providers: [TransactionService, SolanaService],
})
export class TransactionModule {}
