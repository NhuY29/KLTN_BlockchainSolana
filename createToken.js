const {
    Connection,
    Keypair,
    SendTransactionError,
    LAMPORTS_PER_SOL,
} = require('@solana/web3.js');
const {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
} = require('@solana/spl-token');
const bs58 = require('bs58'); 

const connection = new Connection('http://localhost:8899', 'confirmed');

async function createToken(senderSecretKeyBase58, tokenCount) {
    try {
        const senderSecretKey = bs58.decode(senderSecretKeyBase58);
        const payer = Keypair.fromSecretKey(senderSecretKey);
        const mintAuthority = payer.publicKey;
        let balance = await connection.getBalance(mintAuthority);
        console.log(`Số dư hiện tại của ví ${mintAuthority.toBase58()}: ${balance / LAMPORTS_PER_SOL} SOL`);

        if (balance < 0.002 * LAMPORTS_PER_SOL) {
            console.log('Số dư không đủ để thực hiện giao dịch. Đang thực hiện airdrop 0.1 SOL...');
            await connection.requestAirdrop(mintAuthority, 0.1 * LAMPORTS_PER_SOL);
            await new Promise(resolve => setTimeout(resolve, 2000));
            balance = await connection.getBalance(mintAuthority);
            console.log(`Số dư sau khi airdrop: ${balance / LAMPORTS_PER_SOL} SOL`);

            if (balance < 0.002 * LAMPORTS_PER_SOL) {
                console.error('Số dư vẫn không đủ để thực hiện giao dịch sau khi airdrop. Vui lòng kiểm tra lại.');
                return;
            }
        }
        const mint = await createMint(connection, payer, mintAuthority, null, 9);
        console.log(`Mint token đã tạo: ${mint.toBase58()}`);
        console.log(`Mint Authority: ${mintAuthority.toBase58()}`);

        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mint,
            mintAuthority
        );

        console.log(`Tạo tài khoản token: ${tokenAccount.address.toBase58()}`);

        const mintAmount = tokenCount * (10 ** 9);
        await mintTo(
            connection,
            payer,
            mint,
            tokenAccount.address,
            mintAuthority,
            mintAmount
        );

        console.log(`Đã mint ${mintAmount} token vào tài khoản ${tokenAccount.address.toBase58()}`);
    } catch (error) {
        if (error instanceof SendTransactionError) {
            const transactionSignature = error.signature;
            const transactionInfo = await connection.getConfirmedTransaction(transactionSignature);
            console.error('Thông tin giao dịch:', transactionInfo);
        } else {
            console.error('Lỗi:', error);
        }
    }
}


const [,, senderSecretKeyBase58, tokenCountString] = process.argv;


const tokenCount = parseInt(tokenCountString);
if (isNaN(tokenCount) || tokenCount <= 0) {
    console.error('Số lượng token không hợp lệ:', tokenCountString);
} else {
    createToken(senderSecretKeyBase58, tokenCount)
        .catch(err => console.error('Error:', err));
}
