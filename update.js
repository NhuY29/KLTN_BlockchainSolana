const { Connection, PublicKey } = require('@solana/web3.js');
const connection = new Connection('http://localhost:8899', 'confirmed'); 

async function getTransactionDetails(signature) {
    try {
        const transactionDetails = await connection.getTransaction(signature, { commitment: 'confirmed' });
        if (!transactionDetails) {
            console.error("Transaction not found.");
            return;
        }
        console.log("Transaction Details:", transactionDetails);
        console.log("Transaction Signatures:", transactionDetails.transaction.signatures);
        console.log("Transaction Instructions:", transactionDetails.transaction.message.instructions);
        if (transactionDetails.transaction.feePayer) {
            console.log("Fee Payer:", transactionDetails.transaction.feePayer.toBase58());
        } else {
            console.log("Fee Payer not found.");
        }

        console.log("Pre-balances:", transactionDetails.meta.preBalances);
        console.log("Post-balances:", transactionDetails.meta.postBalances);
        console.log("Log Messages (before update):", transactionDetails.meta.logMessages);

        const updatedLogMessages = transactionDetails.meta.logMessages.map(logMessage => {
            if (logMessage.includes('Program log: Transaction Content: hello')) {
                return logMessage.replace('hello', 'hello baby');
            }
            return logMessage;
        });

        console.log("Log Messages (after update):", updatedLogMessages);

    } catch (error) {
        console.error("Error retrieving transaction details:", error.message);
    }
}
const signature = '4xrjUjYGwqnhpprAtQ2TVgBDvfvXH6mczLA2Yny4fteNLAqPj98ZAu3cJK6akMiq1rDEPDBRcpHzGDBcWz5tVeES'; 
getTransactionDetails(signature);
