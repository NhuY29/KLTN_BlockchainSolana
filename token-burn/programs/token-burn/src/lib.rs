use anchor_lang::prelude::*;
use std::time::{SystemTime, UNIX_EPOCH};

declare_id!("2ka4N8KVnNFnn5QYAtxpZg7WpgQFhZm5dkE7jFLqFuFU");

#[program]
pub mod token_burn {
    use super::*;

    pub fn log_content(
        ctx: Context<LogContent>, 
        content: String, 
        reason: String, 
        field: String, 
        describe: String, 
        projectname: String, 
        projectid: String,
        signature: String,
    ) -> Result<()> {
        let current_time = Clock::get()?.unix_timestamp;
        msg!("Transaction Content: {}", content);
        msg!("Reason: {}", reason);
        msg!("Timestamp: {}", current_time);
        msg!("Field: {}", field);
        msg!("Describe: {}", describe);
        msg!("Project Name: {}", projectname);
        msg!("Project ID: {}", projectid);
        msg!("Owner: {}", ctx.accounts.owner.key());
        msg!("Signature: {}", signature);
    
        Ok(())
    }
}
#[derive(Accounts)]
pub struct LogContent<'info> {
    #[account(mut)]
    pub user: Signer<'info>,  
    pub owner: Signer<'info>, 
}
