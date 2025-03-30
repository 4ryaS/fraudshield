import { kafka } from './client';
import { FinancialTransaction } from './types';

const consumer = kafka.consumer({ groupId: "fraud-detection-group" });
const TOPIC_NAME = "financial_transactions";

export async function startTransactionConsumer() {
    await consumer.connect();
    console.log("Consumer connected");

    await consumer.subscribe({
        topic: TOPIC_NAME,
        fromBeginning: true
    });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const transaction: FinancialTransaction = JSON.parse(message.value?.toString() || '{}');

            console.log({
                partition,
                offset: message.offset,
                key: message.key?.toString(),
                transaction: {
                    id: `${transaction.step}-${transaction.nameOrig}`,
                    type: transaction.type,
                    amount: transaction.amount,
                    isFraud: transaction.isFraud === 1
                }
            });

            // Add your fraud detection logic here
            // detectFraud(transaction);
        },
    });
}