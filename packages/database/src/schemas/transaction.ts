// Transaction schema types and interfaces
export interface BlockchainTransaction {
  id: string;
  organizationId: string;
  payrollRunId?: string;
  payrollItemId?: string;
  transactionType: 'payroll' | 'wallet_funding' | 'token_swap' | 'fee_payment';
  fromAddress: string;
  toAddress: string;
  amount: number;
  tokenMint: string; // SOL or SPL token mint address
  signature: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmationCount: number;
  blockTime?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionDto {
  organizationId: string;
  payrollRunId?: string;
  payrollItemId?: string;
  transactionType: 'payroll' | 'wallet_funding' | 'token_swap' | 'fee_payment';
  fromAddress: string;
  toAddress: string;
  amount: number;
  tokenMint: string;
  signature: string;
}

export interface UpdateTransactionDto {
  status?: 'pending' | 'confirmed' | 'failed';
  confirmationCount?: number;
  blockTime?: Date;
  errorMessage?: string;
}
