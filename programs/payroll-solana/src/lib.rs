use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod payroll_solana {
    use super::*;

    /// Initialize a new organization
    pub fn initialize_organization(
        ctx: Context<InitializeOrganization>,
        name: String,
        authorized_signers: Vec<Pubkey>,
    ) -> Result<()> {
        require!(name.len() <= 64, ErrorCode::NameTooLong);
        require!(authorized_signers.len() <= 10, ErrorCode::TooManySigners);

        let organization = &mut ctx.accounts.organization;
        organization.authority = ctx.accounts.authority.key();
        organization.name = name;
        organization.authorized_signers = authorized_signers;
        organization.employee_count = 0;
        organization.total_disbursed = 0;
        organization.bump = ctx.bumps.organization;

        emit!(OrganizationInitialized {
            organization: organization.key(),
            authority: organization.authority,
            name: organization.name.clone(),
        });

        Ok(())
    }

    /// Add an employee to the organization
    pub fn add_employee(
        ctx: Context<AddEmployee>,
        salary: u64,
        payment_token: Pubkey,
    ) -> Result<()> {
        let organization = &mut ctx.accounts.organization;
        let employee = &mut ctx.accounts.employee;

        employee.organization = organization.key();
        employee.wallet = ctx.accounts.employee_wallet.key();
        employee.salary = salary;
        employee.payment_token = payment_token;
        employee.is_active = true;
        employee.bump = ctx.bumps.employee;

        organization.employee_count = organization
            .employee_count
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;

        emit!(EmployeeAdded {
            organization: organization.key(),
            employee: employee.key(),
            wallet: employee.wallet,
            salary,
        });

        Ok(())
    }

    /// Schedule a payroll run
    pub fn schedule_payroll(
        ctx: Context<SchedulePayroll>,
        run_id: u64,
        total_amount: u64,
    ) -> Result<()> {
        let organization = &mut ctx.accounts.organization;
        let payroll_run = &mut ctx.accounts.payroll_run;

        payroll_run.organization = organization.key();
        payroll_run.run_id = run_id;
        payroll_run.total_employees = 0;
        payroll_run.total_amount = total_amount;
        payroll_run.status = PayrollStatus::Pending;
        payroll_run.escrow_account = ctx.accounts.escrow_account.key();
        payroll_run.created_at = Clock::get()?.unix_timestamp;
        payroll_run.bump = ctx.bumps.payroll_run;

        // Transfer funds to escrow
        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.authority.key(),
            &ctx.accounts.escrow_account.key(),
            total_amount,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.escrow_account.to_account_info(),
            ],
        )?;

        emit!(PayrollScheduled {
            organization: organization.key(),
            payroll_run: payroll_run.key(),
            run_id,
            total_amount,
        });

        Ok(())
    }

    /// Execute payroll payments
    pub fn execute_payroll(
        ctx: Context<ExecutePayroll>,
        employees: Vec<EmployeePayment>,
    ) -> Result<()> {
        let payroll_run = &mut ctx.accounts.payroll_run;
        let organization = &mut ctx.accounts.organization;

        require!(
            payroll_run.status == PayrollStatus::Pending,
            ErrorCode::InvalidPayrollStatus
        );

        payroll_run.status = PayrollStatus::InProgress;
        payroll_run.total_employees = employees.len() as u16;

        let mut total_disbursed = 0u64;

        for employee_payment in employees.iter() {
            // Find the employee account in remaining accounts
            let employee_account_info = ctx
                .remaining_accounts
                .iter()
                .find(|account| account.key() == employee_payment.employee)
                .ok_or(ErrorCode::EmployeeNotFound)?;

            let employee_data = EmployeeAccount::try_from(employee_account_info)?;
            require!(employee_data.is_active, ErrorCode::EmployeeNotActive);

            // Transfer funds
            if employee_payment.payment_token == anchor_lang::solana_program::native_token::NATIVE_MINT {
                // SOL transfer
                let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
                    &ctx.accounts.escrow_account.key(),
                    &employee_payment.wallet,
                    employee_payment.amount,
                );

                anchor_lang::solana_program::program::invoke(
                    &transfer_instruction,
                    &[
                        ctx.accounts.escrow_account.to_account_info(),
                        employee_payment.wallet.to_account_info(),
                    ],
                )?;
            } else {
                // SPL token transfer
                let cpi_accounts = Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: employee_payment.token_account.to_account_info(),
                    authority: ctx.accounts.payroll_run.to_account_info(),
                };

                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_ctx = CpiContext::new_with_signer(
                    cpi_program,
                    cpi_accounts,
                    &[&[
                        b"payroll_run",
                        organization.key().as_ref(),
                        &payroll_run.run_id.to_le_bytes(),
                        &[ctx.bumps.payroll_run],
                    ]],
                );

                token::transfer(cpi_ctx, employee_payment.amount)?;
            }

            total_disbursed = total_disbursed
                .checked_add(employee_payment.amount)
                .ok_or(ErrorCode::Overflow)?;
        }

        payroll_run.status = PayrollStatus::Completed;
        organization.total_disbursed = organization
            .total_disbursed
            .checked_add(total_disbursed)
            .ok_or(ErrorCode::Overflow)?;

        emit!(PayrollExecuted {
            organization: organization.key(),
            payroll_run: payroll_run.key(),
            total_disbursed,
            employee_count: employees.len() as u16,
        });

        Ok(())
    }

    /// Close a completed payroll run
    pub fn close_payroll_run(ctx: Context<ClosePayrollRun>) -> Result<()> {
        let payroll_run = &mut ctx.accounts.payroll_run;
        let organization = &mut ctx.accounts.organization;

        require!(
            payroll_run.status == PayrollStatus::Completed,
            ErrorCode::InvalidPayrollStatus
        );

        // Return remaining funds to organization
        let escrow_balance = ctx.accounts.escrow_account.lamports();
        if escrow_balance > 0 {
            **ctx.accounts.escrow_account.to_account_info().try_borrow_mut_lamports()? -=
                escrow_balance;
            **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? +=
                escrow_balance;
        }

        payroll_run.status = PayrollStatus::Cancelled;

        emit!(PayrollClosed {
            organization: organization.key(),
            payroll_run: payroll_run.key(),
            returned_amount: escrow_balance,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String, authorized_signers: Vec<Pubkey>)]
pub struct InitializeOrganization<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 64 + (32 * 10) + 4 + 8 + 1,
        seeds = [b"organization", authority.key().as_ref()],
        bump
    )]
    pub organization: Account<'info, OrganizationAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(salary: u64, payment_token: Pubkey)]
pub struct AddEmployee<'info> {
    #[account(
        mut,
        seeds = [b"organization", organization.authority.as_ref()],
        bump = organization.bump
    )]
    pub organization: Account<'info, OrganizationAccount>,
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 32 + 1 + 1,
        seeds = [b"employee", organization.key().as_ref(), employee_wallet.key().as_ref()],
        bump
    )]
    pub employee: Account<'info, EmployeeAccount>,
    /// CHECK: This is the employee's wallet address
    pub employee_wallet: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(run_id: u64, total_amount: u64)]
pub struct SchedulePayroll<'info> {
    #[account(
        mut,
        seeds = [b"organization", organization.authority.as_ref()],
        bump = organization.bump
    )]
    pub organization: Account<'info, OrganizationAccount>,
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 2 + 8 + 1 + 32 + 8 + 1,
        seeds = [b"payroll_run", organization.key().as_ref(), run_id.to_le_bytes().as_ref()],
        bump
    )]
    pub payroll_run: Account<'info, PayrollRunAccount>,
    #[account(mut)]
    pub escrow_account: SystemAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecutePayroll<'info> {
    #[account(
        mut,
        seeds = [b"organization", organization.authority.as_ref()],
        bump = organization.bump
    )]
    pub organization: Account<'info, OrganizationAccount>,
    #[account(
        mut,
        seeds = [b"payroll_run", organization.key().as_ref(), payroll_run.run_id.to_le_bytes().as_ref()],
        bump = payroll_run.bump
    )]
    pub payroll_run: Account<'info, PayrollRunAccount>,
    #[account(mut)]
    pub escrow_account: SystemAccount<'info>,
    #[account(mut)]
    pub escrow_token_account: Option<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClosePayrollRun<'info> {
    #[account(
        mut,
        seeds = [b"organization", organization.authority.as_ref()],
        bump = organization.bump
    )]
    pub organization: Account<'info, OrganizationAccount>,
    #[account(
        mut,
        seeds = [b"payroll_run", organization.key().as_ref(), payroll_run.run_id.to_le_bytes().as_ref()],
        bump = payroll_run.bump
    )]
    pub payroll_run: Account<'info, PayrollRunAccount>,
    #[account(mut)]
    pub escrow_account: SystemAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct OrganizationAccount {
    pub authority: Pubkey,
    pub name: String,
    pub authorized_signers: Vec<Pubkey>,
    pub employee_count: u32,
    pub total_disbursed: u64,
    pub bump: u8,
}

#[account]
pub struct EmployeeAccount {
    pub organization: Pubkey,
    pub wallet: Pubkey,
    pub salary: u64,
    pub payment_token: Pubkey,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
pub struct PayrollRunAccount {
    pub organization: Pubkey,
    pub run_id: u64,
    pub total_employees: u16,
    pub total_amount: u64,
    pub status: PayrollStatus,
    pub escrow_account: Pubkey,
    pub created_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PayrollStatus {
    Pending,
    InProgress,
    Completed,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct EmployeePayment {
    pub employee: Pubkey,
    pub wallet: Pubkey,
    pub amount: u64,
    pub payment_token: Pubkey,
    pub token_account: Option<Pubkey>,
}

#[event]
pub struct OrganizationInitialized {
    pub organization: Pubkey,
    pub authority: Pubkey,
    pub name: String,
}

#[event]
pub struct EmployeeAdded {
    pub organization: Pubkey,
    pub employee: Pubkey,
    pub wallet: Pubkey,
    pub salary: u64,
}

#[event]
pub struct PayrollScheduled {
    pub organization: Pubkey,
    pub payroll_run: Pubkey,
    pub run_id: u64,
    pub total_amount: u64,
}

#[event]
pub struct PayrollExecuted {
    pub organization: Pubkey,
    pub payroll_run: Pubkey,
    pub total_disbursed: u64,
    pub employee_count: u16,
}

#[event]
pub struct PayrollClosed {
    pub organization: Pubkey,
    pub payroll_run: Pubkey,
    pub returned_amount: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Name too long")]
    NameTooLong,
    #[msg("Too many authorized signers")]
    TooManySigners,
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Invalid payroll status")]
    InvalidPayrollStatus,
    #[msg("Employee not active")]
    EmployeeNotActive,
    #[msg("Employee not found")]
    EmployeeNotFound,
    #[msg("Arithmetic overflow")]
    Overflow,
}
