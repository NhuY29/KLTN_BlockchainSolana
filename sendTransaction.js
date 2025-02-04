const { Connection, Keypair, Transaction, SystemProgram, PublicKey, sendAndConfirmTransaction } = require('@solana/web3.js');
const { Program, AnchorProvider } = require('@project-serum/anchor');
const bs58 = require('bs58');
const idl = require('./myproject/target/idl/myproject.json'); 
const programId = new PublicKey("Db2VQNDuDSTzzqq1DXPa5z1Ve2bY9yJoMo6BujxJ1WS6"); 

const connection = new Connection('http://localhost:8899', 'confirmed');

const [,, senderSecretKeyBase58, receiverPublicKey, amount, content] = process.argv;

async function sendTransaction(senderSecretKeyBase58, receiverPublicKey, amount, content) {
    try {
        const senderSecretKey = bs58.decode(senderSecretKeyBase58);
        const senderKeypair = Keypair.fromSecretKey(senderSecretKey);

        const provider = new AnchorProvider(connection, senderKeypair, AnchorProvider.defaultOptions());
        const program = new Program(idl, programId, provider);
        const logContentIx = await program.methods.logContent(content)
            .accounts({
                user: senderKeypair.publicKey,
            })
            .instruction();
        const transferIx = SystemProgram.transfer({
            fromPubkey: senderKeypair.publicKey,
            toPubkey: new PublicKey(receiverPublicKey),
            lamports: amount
        });
        const transaction = new Transaction().add(logContentIx, transferIx);
        const txid = await sendAndConfirmTransaction(connection, transaction, [senderKeypair], { skipPreflight: false, preflightCommitment: 'confirmed' });

        console.log('Transaction sent successfully with ID:', txid);
        const result = await connection.getTransaction(txid);
        if (result && result.meta && result.meta.logMessages) {
            console.log('Transaction Log Messages:', result.meta.logMessages);
        } else {
            console.log('No log messages available.');
        }

    } catch (error) {
        console.error('Transaction failed:', error);
    }
}

sendTransaction(senderSecretKeyBase58, receiverPublicKey, parseFloat(amount) * 1e9, content)
    .catch(error => console.error('Error:', error));
