import { initKafka } from './admin';
import { startTransactionProducer } from './producer';

const TRANSACTION_FILE = './trimmed_dataset.csv';

const run = async () => {
    try {
        // Initialize Kafka (create topic if needed)
        await initKafka();

        // Start the transaction producer
        await startTransactionProducer(TRANSACTION_FILE);

    } catch (error) {
        console.error("Error in fraud detection system:", error);
        process.exit(1);
    }
};

run().catch(console.error);