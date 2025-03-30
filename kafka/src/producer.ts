import { kafka } from './client';
import fs from 'fs';
import csv from 'csv-parser';
import { randomInt } from 'crypto';
import { FinancialTransaction } from './types';

const producer = kafka.producer();
const TOPIC_NAME = "financial_transactions";

export async function startTransactionProducer(filePath: string) {
    await producer.connect();
    console.log("Producer connected");

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (data: FinancialTransaction) => {
            try {
                await producer.send({
                    topic: TOPIC_NAME,
                    messages: [
                        {
                            key: data.nameOrig, // Using origin account as key
                            value: JSON.stringify(data)
                        }
                    ],
                });

                console.log(`Sent transaction from ${data.nameOrig}`);

                // Simulate real-time streaming with random delay
                await new Promise(resolve =>
                    setTimeout(resolve, randomInt(10, 100))
                );
            } catch (err) {
                console.error('Error producing message:', err);
            }
        })
        .on('end', async () => {
            console.log('Finished streaming transactions');
            await producer.disconnect();
        });
}