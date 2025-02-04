const { PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddress } = require('@solana/spl-token');
const bs58 = require('bs58');

async function getTokenAddress(publicKeyStr, mintAddressStr) {
    try {
        if (!isBase58(publicKeyStr) || !isBase58(mintAddressStr)) {
            throw new Error("Invalid Base58 string");
        }

        const userPublicKey = new PublicKey(publicKeyStr);
        const mintAddress = new PublicKey(mintAddressStr);

        const tokenAddress = await getAssociatedTokenAddress(mintAddress, userPublicKey);

        console.log(tokenAddress.toBase58());
    } catch (error) {
        console.error('Error fetching token address:', error);
        console.log(error.message);  
    }
}

function isBase58(str) {
    try {
        bs58.decode(str);  
        return true;  
    } catch (e) {
        return false;  
    }
}

const publicKeyStr = process.argv[2];
const mintAddressStr = process.argv[3];

if (!publicKeyStr || !mintAddressStr) {
    console.log('Please provide both publicKey and mintAddress as arguments.');
    process.exit(1);
}


getTokenAddress(publicKeyStr, mintAddressStr);
