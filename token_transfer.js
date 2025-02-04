const {
    Connection,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
    Keypair,
    SystemProgram,
} = require('@solana/web3.js');
const {
    createTransferInstruction,
    getOrCreateAssociatedTokenAccount,
    getAccount,
    TOKEN_PROGRAM_ID,
} = require('@solana/spl-token');
const bs58 = require('bs58');
const connection = new Connection('http://localhost:8899', 'confirmed');

async function checkTokenBalance(tokenAccount) {
    const accountInfo = await getAccount(connection, tokenAccount);
    return accountInfo.amount;
}

async function transferToken(senderSecretKeyBase58, toAddressBase58, mintAddressBase58, amount, solAmount, receiverSecretKeyBase58) {
    try {
        const senderSecretKey = bs58.decode(senderSecretKeyBase58);
        const sender = Keypair.fromSecretKey(senderSecretKey);
        
        const mintAddress = new PublicKey(mintAddressBase58);
        const toAddress = new PublicKey(toAddressBase58);
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            sender,
            mintAddress,
            toAddress
        );
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            sender,
            mintAddress,
            sender.publicKey
        );

        const fromBalance = await checkTokenBalance(fromTokenAccount.address);
        
        if (fromBalance < amount) {
            console.error('Lỗi: Tài khoản gửi không đủ tín chỉ để chuyển.');
            return;
        }
        if (receiverSecretKeyBase58) {
            const receiverSecretKey = bs58.decode(receiverSecretKeyBase58);
            const receiver = Keypair.fromSecretKey(receiverSecretKey);

            const receiverBalance = await connection.getBalance(receiver.publicKey);
            
            if (receiverBalance < solAmount * 1000000000) {
                console.error('Lỗi: Tài khoản không đủ số dư.');
                return;
            }
        }
        const DECIMALS = 9;
        const amountToSend = amount * Math.pow(10, DECIMALS);
        const transaction = new Transaction()
            .add(
                createTransferInstruction(
                    fromTokenAccount.address,
                    toTokenAccount.address,
                    sender.publicKey,
                    amountToSend,
                    [],
                    TOKEN_PROGRAM_ID
                )
            );
        
        let tokenTransferSuccess = false;
        try {
            const signature = await sendAndConfirmTransaction(connection, transaction, [sender]);
            console.log(`Giao dịch chuyển token đã được xác nhận với chữ ký: ${signature}`);
            tokenTransferSuccess = true;
        } catch (error) {
            console.error('Lỗi khi chuyển token:', error);
        }
        if (tokenTransferSuccess && receiverSecretKeyBase58) {
            try {
                const receiverSecretKey = bs58.decode(receiverSecretKeyBase58);
                const receiver = Keypair.fromSecretKey(receiverSecretKey);

                const transferSolTransaction = new Transaction().add(
                    SystemProgram.transfer({
                        fromPubkey: receiver.publicKey,
                        toPubkey: sender.publicKey,
                        lamports: solAmount * 1000000000, 
                    })
                );
                
                const solSignature = await sendAndConfirmTransaction(connection, transferSolTransaction, [receiver]);
                console.log(`Giao dịch chuyển SOL đã được xác nhận với chữ ký: ${solSignature}`);

                console.log("Cả hai giao dịch chuyển token và SOL đã hoàn tất thành công!");
            } catch (error) {
                console.error('Lỗi khi chuyển SOL:', error);
                console.error('Chỉ có giao dịch chuyển token thành công, nhưng chuyển SOL thất bại.');
            }
        } else if (!tokenTransferSuccess) {
            console.error('Giao dịch chuyển token thất bại, không thực hiện chuyển SOL.');
        } else {
            console.log("Chưa có secret key của người nhận để chuyển SOL.");
        }

    } catch (error) {
        console.error('Lỗi khi thực hiện chuyển:', error);
    }
}

const [,, senderSecretKeyBase58, toAddressBase58, mintAddressBase58, amountString, solAmountString, receiverSecretKeyBase58] = process.argv;

const amount = parseFloat(amountString);
const solAmount = parseFloat(solAmountString);

if (isNaN(amount) || amount <= 0) {
    console.error('Số lượng tín chỉ không hợp lệ:', amountString);
} else if (isNaN(solAmount) || solAmount < 0) {
    console.error('Số lượng tiền không hợp lệ:', solAmountString);
} else {
    transferToken(senderSecretKeyBase58, toAddressBase58, mintAddressBase58, amount, solAmount, receiverSecretKeyBase58)
        .catch(err => console.error('Error:', err));
}
