const anchor = require("@project-serum/anchor");
const { Connection, Keypair, PublicKey, Transaction } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, createBurnCheckedInstruction } = require('@solana/spl-token');
const bs58 = require('bs58');

const IDL = require("./token-burn/target/idl/token_burn.json");
const PROGRAM_ID = new PublicKey("2ka4N8KVnNFnn5QYAtxpZg7WpgQFhZm5dkE7jFLqFuFU");

const connection = new Connection('http://localhost:8899', 'confirmed');

const secretKeyBase58 = process.argv[2]; 
const secretKey = Uint8Array.from(bs58.decode(secretKeyBase58));
const authority = Keypair.fromSecretKey(secretKey);

const args = process.argv.slice(3); 
const mintAddresses = args[0].split(",").map(address => new PublicKey(address.trim()));
const amounts = args[1].split(",").map(amount => new anchor.BN(amount.trim()));
const projectName = args[2] || "";
const projectId = args[3] || "";
const eventDescription = args[4] || "";
const eventField = args[5] || "";
const eventReason = args[6] || "";
const evenContent = args[7] || "";

const tokens = mintAddresses.map((mintAddress, index) => ({
    mintAddress,
    amountToken: amounts[index],
}));

const projectInfo = {
    name: projectName,
    id: projectId,
};

async function burnAndLog(tokens, projectInfo, eventDescription) {
    try {
        const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(authority), {
            preflightCommitment: "confirmed",
        });
        anchor.setProvider(provider);
        const program = new anchor.Program(IDL, PROGRAM_ID, provider);
        const transaction = new Transaction();
        
        for (const { mintAddress, amountToken } of tokens) {
            const tokenAccountInfo = await getOrCreateAssociatedTokenAccount(
                connection,
                authority,
                mintAddress,
                authority.publicKey
            );

            const balance = await connection.getTokenAccountBalance(tokenAccountInfo.address);
            const tokenBalance = new anchor.BN(balance.value.amount);

            if (tokenBalance.lt(amountToken)) {
                const errorMessage = `Không đủ token trong tài khoản ${tokenAccountInfo.address.toBase58()} để đốt.`;
                console.error(errorMessage);

                
                return {
                    status: 'failure',
                    message: errorMessage,
                    transactionId: null,
                };
            }

            const burnInstruction = createBurnCheckedInstruction(
                tokenAccountInfo.address,
                mintAddress,
                authority.publicKey,
                amountToken,
                9,
                []
            );
            transaction.add(burnInstruction);
        }

        const signature = await connection.sendTransaction(transaction, [authority]);

        const tx = await program.methods
            .logContent(
                evenContent,
                eventReason,
                eventField,
                eventDescription,
                projectInfo.name,
                projectInfo.id,
                signature
            )
            .accounts({
                user: authority.publicKey,
                owner: authority.publicKey,
            })
            .signers([authority])
            .rpc();

        console.log("Transaction to log content successful:", tx);

        
        return {
            status: 'success',
            message: 'Transaction to log content successful',
            transactionId: tx,
        };

    } catch (error) {
        console.error('Error burning tokens or logging content:', error);

        
        return {
            status: 'failure',
            message: 'Error burning tokens or logging content',
            transactionId: null,
        };
    }
}

burnAndLog(tokens, projectInfo, eventDescription)
    .then(result => {
        console.log(JSON.stringify(result, null, 2));  
    })
    .catch(error => {
        console.error('Error:', error);
    });
