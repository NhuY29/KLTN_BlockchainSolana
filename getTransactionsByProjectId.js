const { Connection, PublicKey } = require('@solana/web3.js');

const projectId = process.argv[2];  
if (!projectId) {
  console.error("Please provide a projectId as a command line argument.");
  process.exit(1); 
}

const connection = new Connection("http://127.0.0.1:8899", 'confirmed');
const publicKey = new PublicKey('2ka4N8KVnNFnn5QYAtxpZg7WpgQFhZm5dkE7jFLqFuFU');

function calculateAge(timestamp) {
  const currentTimestamp = Math.floor(Date.now() / 1000);  
  const ageInSeconds = currentTimestamp - timestamp;
  const ageInMinutes = Math.floor(ageInSeconds / 60);
  const ageInHours = Math.floor(ageInMinutes / 60);
  const ageInDays = Math.floor(ageInHours / 24);

  return {
    ageInSeconds,
    ageInMinutes,
    ageInHours,
    ageInDays,
  };
}

async function getTransactionsByProjectId() {
  try {
    const confirmedSignatures = await connection.getConfirmedSignaturesForAddress2(publicKey, { limit: 100 });

    for (const signatureInfo of confirmedSignatures) {
      const transaction = await connection.getTransaction(signatureInfo.signature);

      if (transaction && transaction.meta) {
        const logs = transaction.meta.logMessages;
        
        logs.forEach(log => {
          if (log.includes(projectId)) {
            const timestamp = transaction.blockTime;
            const age = calculateAge(timestamp);
            const blockNumber = transaction.slot;
            const transactionData = {
              transactionSignature: signatureInfo.signature,
              timestamp: new Date(timestamp * 1000).toISOString(),
              ageInDays: age.ageInDays,
              blockNumber: blockNumber,
            };
            console.log(JSON.stringify(transactionData));
          }
        });
      }
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
}

getTransactionsByProjectId();
