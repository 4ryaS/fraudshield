import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    brokers: ['localhost:9092'],
    clientId: "fraud-detection-system",
});