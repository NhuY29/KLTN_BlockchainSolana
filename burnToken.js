const { Connection, PublicKey, Keypair, Transaction } = require('@solana/web3.js'); 
const { TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, createBurnCheckedInstruction } = require('@solana/spl-token');
const bs58 = require('bs58');

const connection = new Connection('http://localhost:8899', 'confirmed');
const mintAddress = new PublicKey('Ds37THKH7G1MCBqdp7tF7fcipbrzNfGz4CZNwqBh5c42');
const secretKeyBase58 = '4peTTrcrWHer4t8mwNroCDdZVVSBTohR1fwgtAB9cZDpQuvXoeQWvegbAzMbPXdrMHB3fh8qcfQaozy8yCfhZjhJ'; 
const secretKey = Uint8Array.from(bs58.decode(secretKeyBase58));
const authority = Keypair.fromSecretKey(secretKey);
async function getTokenTransactionsAndBurn(burnAmount) {
    try {
        const tokenAccountInfo = await getOrCreateAssociatedTokenAccount(
            connection,
            authority,          
            mintAddress,       
            authority.publicKey  
        );

        console.log('Token Account:', tokenAccountInfo.address.toBase58());
        const burnInstruction = createBurnCheckedInstruction(
            tokenAccountInfo.address, 
            mintAddress,              
            authority.publicKey,      
            burnAmount,                
            9,                          
            []
        );
        const transaction = new Transaction().add(burnInstruction);
        const signature = await connection.sendTransaction(transaction, [authority]);

        console.log(`Successfully burned ${burnAmount} tokens from ${tokenAccountInfo.address.toBase58()}`);
        console.log(`Transaction signature: ${signature}`);
        await getTokenTransactions();

    } catch (error) {
        console.error('Error burning tokens or fetching transactions:', error);
    }
}

async function getTokenTransactions() {
    try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(authority.publicKey, {
            programId: TOKEN_PROGRAM_ID,
        });

        let transactions = [];

        for (let i = 0; i < tokenAccounts.value.length; i++) {
            const tokenAccount = tokenAccounts.value[i].account;
            const tokenAddress = tokenAccount.data.parsed.info.owner;

            const transactionSignatures = await connection.getConfirmedSignaturesForAddress2(
                new PublicKey(tokenAddress),
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

const burnAmount = 1000000000;
getTokenTransactionsAndBurn(burnAmount);
