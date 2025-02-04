use anchor_lang::prelude::*;
declare_id!("Db2VQNDuDSTzzqq1DXPa5z1Ve2bY9yJoMo6BujxJ1WS6");

#[program]
pub mod myproject {
    use super::*;

    pub fn log_content(ctx: Context<LogContent>, content: String) -> Result<()> {
        msg!("Transaction Content: {}", content);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct LogContent<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
}
