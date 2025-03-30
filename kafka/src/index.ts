import { initKafka } from './admin';
import { startTransactionProducer } from './producer';
import { startTransactionConsumer } from './consumer';

const TRANSACTION_FILE = '../data/transaction_data.csv';

const run = async () => {
    try {
        // Initialize Kafka (create topic if needed)
        await initKafka();

        // Start the transaction consumer
        await startTransactionConsumer();

        // Start the transaction producer
        await startTransactionProducer(TRANSACTION_FILE);

    } catch (error) {
        console.error("Error in fraud detection system:", error);
        process.exit(1);
    }
};

run().catch(console.error);