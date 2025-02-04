const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const connection = new Connection('http://localhost:8899', 'confirmed');

const keypairData = JSON.parse(fs.readFileSync('solana-keypair.json'));
const publicKey = new PublicKey(keypairData.publicKey);

const amount = 1 * LAMPORTS_PER_SOL; 

async function requestAirdrop() {
    try {
        const airdropSignature = await connection.requestAirdrop(publicKey, amount);

        await connection.confirmTransaction(airdropSignature);

        console.log(`Yêu cầu nạp tiền thành công. Đã gửi ${amount / LAMPORTS_PER_SOL} SOL`);
    } catch (error) {
        console.error('Lỗi khi yêu cầu nạp tiền:', error);
    }
}

requestAirdrop();
