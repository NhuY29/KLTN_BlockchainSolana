const { Connection, PublicKey } = require('@solana/web3.js');

const connection = new Connection('http://localhost:8899', 'confirmed');

const mintAddress = new PublicKey('DuwwAqCryeqqz4UbkqLe1zFfWKS5rSvZ2t186kCSZRwL');

async function getTokenTransactions() {
    try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(mintAddress, {
            programId: new PublicKey('TokenkegQfeZyiNwAJb8eJ4UkKJctHhscxXkSxPbQhbQj'), 
        });

        let transactions = [];
        for (let i = 0; i < tokenAccounts.value.length; i++) {
            const tokenAccount = tokenAccounts.value[i].account;
            const tokenAddress = tokenAccount.data.parsed.info.owner;

            const transactionSignatures = await connection.getConfirmedSignaturesForAddress(
                tokenAddress,
                { limit: 10 } 
            );
            for (let tx of transactionSignatures) {
                const txDetails = await connection.getTransaction(tx.signature);
                if (txDetails) {
                    transactions.push({
                        signature: tx.signature,
                        blockTime: txDetails.blockTime,
                        transaction: txDetails.transaction,
                    });
                }
            }
        }

        console.log('All Transactions:', transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

getTokenTransactions();
