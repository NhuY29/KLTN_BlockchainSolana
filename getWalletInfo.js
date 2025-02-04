
const { Connection, PublicKey } = require('@solana/web3.js');

const publicKeyString = process.argv[2];
const publicKey = new PublicKey(publicKeyString);

const connection = new Connection('http://localhost:8899', 'confirmed');

async function getWalletInfo() {
  try {
    const balance = await connection.getBalance(publicKey);
    const walletInfo = {
      address: publicKey.toBase58(),
      balance: balance / 1e9 
    };
    console.log(JSON.stringify(walletInfo));
  } catch (error) {
    console.error('Lỗi khi lấy thông tin ví:', error);
  }
}

getWalletInfo();
