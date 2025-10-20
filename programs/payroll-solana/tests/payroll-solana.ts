import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PayrollSolana } from "../target/types/payroll_solana";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { expect } from "chai";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
} from "@solana/spl-token";

describe("payroll-solana", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PayrollSolana as Program<PayrollSolana>;
  const provider = anchor.getProvider();

  // Test accounts
  let organizationAuthority: Keypair;
  let employeeWallet: Keypair;
  let organizationPda: PublicKey;
  let employeePda: PublicKey;
  let payrollRunPda: PublicKey;
  let escrowAccount: Keypair;
  let usdcMint: PublicKey;
  let usdcTokenAccount: PublicKey;

  before(async () => {
    // Generate test keypairs
    organizationAuthority = Keypair.generate();
    employeeWallet = Keypair.generate();
    escrowAccount = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(
      organizationAuthority.publicKey,
      10 * LAMPORTS_PER_SOL
    );
    await provider.connection.requestAirdrop(
      employeeWallet.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.requestAirdrop(
      escrowAccount.publicKey,
      2 * LAMPORTS_PER_SOL
    );

    // Create USDC mint for testing
    usdcMint = await createMint(
      provider.connection,
      organizationAuthority,
      organizationAuthority.publicKey,
      null,
      6
    );

    // Create USDC token account for employee
    usdcTokenAccount = await createAccount(
      provider.connection,
      employeeWallet,
      usdcMint,
      employeeWallet.publicKey
    );

    // Mint USDC to employee token account
    await mintTo(
      provider.connection,
      organizationAuthority,
      usdcMint,
      usdcTokenAccount,
      organizationAuthority,
      1000 * 10 ** 6 // 1000 USDC
    );

    // Derive PDAs
    [organizationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("organization"), organizationAuthority.publicKey.toBuffer()],
      program.programId
    );

    [employeePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("employee"),
        organizationPda.toBuffer(),
        employeeWallet.publicKey.toBuffer(),
      ],
      program.programId
    );
  });

  it("Initializes organization", async () => {
    const authorizedSigners = [organizationAuthority.publicKey];

    const tx = await program.methods
      .initializeOrganization("Test Org", authorizedSigners)
      .accounts({
        organization: organizationPda,
        authority: organizationAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([organizationAuthority])
      .rpc();

    console.log("Organization initialization transaction:", tx);

    const organization =
      await program.account.organizationAccount.fetch(organizationPda);
    expect(organization.name).to.equal("Test Org");
    expect(organization.authority.toString()).to.equal(
      organizationAuthority.publicKey.toString()
    );
    expect(organization.authorizedSigners.length).to.equal(1);
    expect(organization.employeeCount.toNumber()).to.equal(0);
    expect(organization.totalDisbursed.toNumber()).to.equal(0);
  });

  it("Adds employee to organization", async () => {
    const salary = new anchor.BN(1000 * LAMPORTS_PER_SOL); // 1000 SOL
    const paymentToken = PublicKey.default; // SOL

    const tx = await program.methods
      .addEmployee(salary, paymentToken)
      .accounts({
        organization: organizationPda,
        employee: employeePda,
        employeeWallet: employeeWallet.publicKey,
        authority: organizationAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([organizationAuthority])
      .rpc();

    console.log("Employee addition transaction:", tx);

    const employee = await program.account.employeeAccount.fetch(employeePda);
    expect(employee.organization.toString()).to.equal(
      organizationPda.toString()
    );
    expect(employee.wallet.toString()).to.equal(
      employeeWallet.publicKey.toString()
    );
    expect(employee.salary.toString()).to.equal(salary.toString());
    expect(employee.paymentToken.toString()).to.equal(paymentToken.toString());
    expect(employee.isActive).to.be.true;

    const organization =
      await program.account.organizationAccount.fetch(organizationPda);
    expect(organization.employeeCount.toNumber()).to.equal(1);
  });

  it("Schedules payroll run", async () => {
    const runId = new anchor.BN(1);
    const totalAmount = new anchor.BN(500 * LAMPORTS_PER_SOL); // 500 SOL

    [payrollRunPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("payroll_run"),
        organizationPda.toBuffer(),
        runId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const tx = await program.methods
      .schedulePayroll(runId, totalAmount)
      .accounts({
        organization: organizationPda,
        payrollRun: payrollRunPda,
        escrowAccount: escrowAccount.publicKey,
        authority: organizationAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([organizationAuthority])
      .rpc();

    console.log("Payroll scheduling transaction:", tx);

    const payrollRun =
      await program.account.payrollRunAccount.fetch(payrollRunPda);
    expect(payrollRun.organization.toString()).to.equal(
      organizationPda.toString()
    );
    expect(payrollRun.runId.toString()).to.equal(runId.toString());
    expect(payrollRun.totalAmount.toString()).to.equal(totalAmount.toString());
    expect(payrollRun.status.pending).to.be.true;
    expect(payrollRun.escrowAccount.toString()).to.equal(
      escrowAccount.publicKey.toString()
    );
  });

  it("Executes payroll with SOL payments", async () => {
    const employees = [
      {
        employee: employeePda,
        wallet: employeeWallet.publicKey,
        amount: new anchor.BN(100 * LAMPORTS_PER_SOL), // 100 SOL
        paymentToken: PublicKey.default, // SOL
        tokenAccount: null,
      },
    ];

    const tx = await program.methods
      .executePayroll(employees)
      .accounts({
        organization: organizationPda,
        payrollRun: payrollRunPda,
        escrowAccount: escrowAccount.publicKey,
        escrowTokenAccount: null,
        authority: organizationAuthority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts([
        {
          pubkey: employeePda,
          isSigner: false,
          isWritable: false,
        },
      ])
      .signers([organizationAuthority])
      .rpc();

    console.log("Payroll execution transaction:", tx);

    const payrollRun =
      await program.account.payrollRunAccount.fetch(payrollRunPda);
    expect(payrollRun.status.completed).to.be.true;
    expect(payrollRun.totalEmployees).to.equal(1);

    const organization =
      await program.account.organizationAccount.fetch(organizationPda);
    expect(organization.totalDisbursed.toNumber()).to.equal(
      100 * LAMPORTS_PER_SOL
    );
  });

  it("Closes completed payroll run", async () => {
    const tx = await program.methods
      .closePayrollRun()
      .accounts({
        organization: organizationPda,
        payrollRun: payrollRunPda,
        escrowAccount: escrowAccount.publicKey,
        authority: organizationAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([organizationAuthority])
      .rpc();

    console.log("Payroll closure transaction:", tx);

    const payrollRun =
      await program.account.payrollRunAccount.fetch(payrollRunPda);
    expect(payrollRun.status.cancelled).to.be.true;
  });

  it("Handles error cases", async () => {
    // Test adding employee with invalid authority
    try {
      const invalidAuthority = Keypair.generate();
      await program.methods
        .addEmployee(new anchor.BN(1000), PublicKey.default)
        .accounts({
          organization: organizationPda,
          employee: Keypair.generate().publicKey,
          employeeWallet: Keypair.generate().publicKey,
          authority: invalidAuthority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([invalidAuthority])
        .rpc();
      expect.fail("Should have failed with invalid authority");
    } catch (error) {
      expect(error.message).to.include("InvalidAuthority");
    }

    // Test executing payroll with invalid status
    try {
      const newPayrollRun = Keypair.generate();
      await program.methods
        .executePayroll([])
        .accounts({
          organization: organizationPda,
          payrollRun: newPayrollRun.publicKey,
          escrowAccount: Keypair.generate().publicKey,
          escrowTokenAccount: null,
          authority: organizationAuthority.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([organizationAuthority])
        .rpc();
      expect.fail("Should have failed with invalid payroll status");
    } catch (error) {
      expect(error.message).to.include("InvalidPayrollStatus");
    }
  });

  it("Tests USDC token payments", async () => {
    // Create a new employee with USDC payment token
    const usdcEmployeeWallet = Keypair.generate();
    const usdcEmployeePda = PublicKey.findProgramAddressSync(
      [
        Buffer.from("employee"),
        organizationPda.toBuffer(),
        usdcEmployeeWallet.publicKey.toBuffer(),
      ],
      program.programId
    )[0];

    // Add USDC employee
    await program.methods
      .addEmployee(new anchor.BN(1000), usdcMint)
      .accounts({
        organization: organizationPda,
        employee: usdcEmployeePda,
        employeeWallet: usdcEmployeeWallet.publicKey,
        authority: organizationAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([organizationAuthority])
      .rpc();

    // Create USDC token account for employee
    const employeeUsdcAccount = await createAccount(
      provider.connection,
      usdcEmployeeWallet,
      usdcMint,
      usdcEmployeeWallet.publicKey
    );

    // Schedule new payroll run for USDC
    const usdcRunId = new anchor.BN(2);
    const usdcPayrollRunPda = PublicKey.findProgramAddressSync(
      [
        Buffer.from("payroll_run"),
        organizationPda.toBuffer(),
        usdcRunId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];

    const usdcEscrowAccount = Keypair.generate();
    await provider.connection.requestAirdrop(
      usdcEscrowAccount.publicKey,
      LAMPORTS_PER_SOL
    );

    // Create USDC escrow token account
    const usdcEscrowTokenAccount = await createAccount(
      provider.connection,
      usdcEscrowAccount,
      usdcMint,
      usdcEscrowAccount.publicKey
    );

    // Mint USDC to escrow
    await mintTo(
      provider.connection,
      organizationAuthority,
      usdcMint,
      usdcEscrowTokenAccount,
      organizationAuthority,
      1000 * 10 ** 6 // 1000 USDC
    );

    // Schedule USDC payroll
    await program.methods
      .schedulePayroll(usdcRunId, new anchor.BN(500 * 10 ** 6)) // 500 USDC
      .accounts({
        organization: organizationPda,
        payrollRun: usdcPayrollRunPda,
        escrowAccount: usdcEscrowAccount.publicKey,
        authority: organizationAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([organizationAuthority])
      .rpc();

    // Execute USDC payroll
    const usdcEmployees = [
      {
        employee: usdcEmployeePda,
        wallet: usdcEmployeeWallet.publicKey,
        amount: new anchor.BN(100 * 10 ** 6), // 100 USDC
        paymentToken: usdcMint,
        tokenAccount: employeeUsdcAccount,
      },
    ];

    await program.methods
      .executePayroll(usdcEmployees)
      .accounts({
        organization: organizationPda,
        payrollRun: usdcPayrollRunPda,
        escrowAccount: usdcEscrowAccount.publicKey,
        escrowTokenAccount: usdcEscrowTokenAccount,
        authority: organizationAuthority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts([
        {
          pubkey: usdcEmployeePda,
          isSigner: false,
          isWritable: false,
        },
      ])
      .signers([organizationAuthority])
      .rpc();

    const usdcPayrollRun =
      await program.account.payrollRunAccount.fetch(usdcPayrollRunPda);
    expect(usdcPayrollRun.status.completed).to.be.true;
  });
});

