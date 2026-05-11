import { Kafka, Partitioners } from 'kafkajs';
import { config } from '@eventflux/config';
import { logger } from '@eventflux/logger';

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
});

export const producer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner,
  idempotent: true, 
  maxInFlightRequests: 1, 
});

export async function publishEvent(topic: string, eventId: string, payload: any) {
  try {
    await producer.send({
      topic,
      messages: [
        {
          key: eventId, 
          value: JSON.stringify(payload),
          headers: { eventId } 
        }
      ]
    });
    logger.info(`✅ Published event ${eventId} to ${topic}`);
  } catch (error: any) {
    logger.error(`❌ Failed to publish to ${topic}: ${error.message}`);
    throw error;
  }
}