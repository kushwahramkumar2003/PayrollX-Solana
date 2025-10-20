import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
// import { Wallet } from "@solana/wallet-adapter-base";
// import { PayrollSolana } from "../types/payroll_solana";

// Define a simple wallet interface compatible with Anchor
interface Wallet {
  publicKey: PublicKey;
  signTransaction: <T extends any>(tx: T) => Promise<T>;
  signAllTransactions: <T extends any>(txs: T[]) => Promise<T[]>;
}

// Program ID - should match your deployed program
const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ||
    "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
);

// USDC mint address on devnet
export const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ||
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

// Connection to Solana cluster
export const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet"),
  "confirmed"
);

// Initialize Anchor program
export function getProgram(wallet: Wallet): Program<any> {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });

  // For now, return a mock program until we have the actual IDL
  return {} as Program<any>;
}

// PDA helpers
export function getOrganizationPda(authority: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("organization"), authority.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

export function getEmployeePda(
  organization: PublicKey,
  employeeWallet: PublicKey
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("employee"),
      organization.toBuffer(),
      employeeWallet.toBuffer(),
    ],
    PROGRAM_ID
  );
  return pda;
}

export function getPayrollRunPda(
  organization: PublicKey,
  runId: number
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("payroll_run"),
      organization.toBuffer(),
      Buffer.from(runId.toString()),
    ],
    PROGRAM_ID
  );
  return pda;
}

// Account fetchers
export async function getOrganizationAccount(organizationPda: PublicKey) {
  try {
    const accountInfo = await connection.getAccountInfo(organizationPda);
    if (!accountInfo) return null;

    // Parse account data (you would use your program's account layout here)
    return accountInfo.data;
  } catch (error) {
    console.error("Error fetching organization account:", error);
    return null;
  }
}

export async function getEmployeeAccount(employeePda: PublicKey) {
  try {
    const accountInfo = await connection.getAccountInfo(employeePda);
    if (!accountInfo) return null;

    return accountInfo.data;
  } catch (error) {
    console.error("Error fetching employee account:", error);
    return null;
  }
}

export async function getPayrollRunAccount(payrollRunPda: PublicKey) {
  try {
    const accountInfo = await connection.getAccountInfo(payrollRunPda);
    if (!accountInfo) return null;

    return accountInfo.data;
  } catch (error) {
    console.error("Error fetching payroll run account:", error);
    return null;
  }
}

// Balance helpers
export async function getSolBalance(publicKey: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error("Error fetching SOL balance:", error);
    return 0;
  }
}

export async function getTokenBalance(
  publicKey: PublicKey,
  mint: PublicKey
): Promise<number> {
  try {
    // This would require SPL token account setup
    // For now, return 0
    return 0;
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return 0;
  }
}

