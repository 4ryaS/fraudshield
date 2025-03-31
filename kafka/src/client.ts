import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    brokers: ['192.168.244.50:9092'],
    clientId: "fraud-detection-system",
});