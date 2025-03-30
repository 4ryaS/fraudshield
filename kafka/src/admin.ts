import { kafka } from './client';

const TOPIC_NAME = "financial_transactions";
const NUM_PARTITIONS = 3;

export async function initKafka() {
    const admin = kafka.admin();

    console.log("Connecting to Kafka admin...");
    await admin.connect();

    console.log("Creating topic [financial_transactions]");
    await admin.createTopics({
        topics: [
            {
                topic: TOPIC_NAME,
                numPartitions: NUM_PARTITIONS,
                replicationFactor: 1,
                configEntries: [
                    { name: 'retention.ms', value: '604800000' } // 7 days retention
                ]
            },
        ],
    });

    console.log("Topic successfully created");
    await admin.disconnect();
}