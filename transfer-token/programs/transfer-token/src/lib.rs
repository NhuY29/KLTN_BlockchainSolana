use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("ETSLjWxqn2WB81Mfo1tMsohdjqJceUNh7iBQ4hoZNxt2");

#[program]
pub mod token_transfer {
    use super::*;

    // Hàm chuyển token giữa hai tài khoản
    pub fn transfer_tokens(
        ctx: Context<TransferTokens>,
        amount: u64, // số lượng token cần chuyển
    ) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.from_token_account.to_account_info(),
            to: ctx.accounts.to_token_account.to_account_info(),
            authority: ctx.accounts.from_authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, amount)?;

        msg!("Transferred {} tokens successfully", amount);
        Ok(())
    }
}

// Cấu trúc cho việc chuyển token
#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub from_token_account: Account<'info, TokenAccount>, // Tài khoản nguồn chứa token
    #[account(mut)]
    pub to_token_account: Account<'info, TokenAccount>, // Tài khoản đích nhận token
    pub from_authority: Signer<'info>, // Chủ tài khoản nguồn
    pub token_program: Program<'info, Token>, // Chương trình quản lý token (SPL token)
}
