const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58'); 


const keypair = Keypair.generate();
const publicKey = keypair.publicKey.toString();
const secretKeyBase58 = bs58.encode(keypair.secretKey);


console.log(`Public Key: ${publicKey}`);
console.log(`Secret Key (Base58): ${secretKeyBase58}`);
