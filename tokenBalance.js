const { Connection, PublicKey } = require('@solana/web3.js');
const { getAccount } = require('@solana/spl-token');

async function getTokenBalance(mintAddressBase58, tokenAccountAddressBase58) {

  const connection = new Connection('http://localhost:8899', 'confirmed');

  const mintAddress = new PublicKey(mintAddressBase58);
  const tokenAccountAddress = new PublicKey(tokenAccountAddressBase58);

  try {
    const accountInfo = await getAccount(connection, tokenAccountAddress);

    console.log(`Số dư token: ${accountInfo.amount}`);
  } catch (error) {
    console.error('Không thể lấy thông tin tài khoản:', error);
  }
}

const mintAddressBase58 = process.argv[2];
const tokenAccountAddressBase58 = process.argv[3];

if (!mintAddressBase58 || !tokenAccountAddressBase58) {
  console.error('Vui lòng nhập đủ các tham số: <mintAddress> <tokenAccountAddress>');
  process.exit(1);
}
getTokenBalance(mintAddressBase58, tokenAccountAddressBase58);
  