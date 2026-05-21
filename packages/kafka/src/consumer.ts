import { Kafka } from 'kafkajs';
import { config } from '@eventflux/config';
import { logger } from '@eventflux/logger';
import { db } from '@eventflux/database';
import { producer } from './producer.js';

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
  connectionTimeout : 10000,
  requestTimeout : 30000,
  retry :{
    initialRetryTime : 300,
    retries : 8
  }
});

export const consumer = kafka.consumer({ 
  groupId: 'eventflux-engine-group',
  sessionTimeout : 30000,
  heartbeatInterval : 3000,
  maxWaitTimeInMs : 1000,
  allowAutoTopicCreation : true,
});

type MessageHandler = (payload: any) => Promise<void>;
const registry = new Map<string, MessageHandler>();

export function registerHandler(topic: string, handler: MessageHandler) {
  registry.set(topic, handler);
}

export async function startConsumer() {
  await consumer.connect();
  
  await consumer.subscribe({ topic: 'workflow-events', fromBeginning: false });
  await consumer.subscribe({ topic: 'execution-events', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const eventId = message.headers?.eventId?.toString() || message.key?.toString();
      if (!eventId) return; 

      const existing = await db.processedEvent.findUnique({ where: { eventId } });
      if (existing) {
        logger.info(`⏭️ Skipping duplicate event: ${eventId}`);
        return;
      }

      const payload = JSON.parse(message.value?.toString() || '{}');
      const handler = registry.get(topic);

      if (handler) {
        await processWithRetryAndDLQ(topic, eventId, payload, handler);
      }
    },
  });
}


async function processWithRetryAndDLQ(topic: string, eventId: string, payload: any, handler: MessageHandler) {
  let attempts = 0;
  const maxRetries = 3;

  while (attempts < maxRetries) {
    try {
      await handler(payload);
      
      await db.processedEvent.create({ data: { eventId, topic, status: 'PROCESSED' } });
      return; 

    } catch (error: any) {
      attempts++;
      logger.error(`⚠️ Attempt ${attempts} failed for ${eventId}: ${error.message}`);
      
      if (attempts >= maxRetries) {
        logger.error(`☠️ Max retries reached. Sending ${eventId} to DLQ.`);
        await producer.send({
          topic: `${topic}.DLQ`,
          messages: [{ key: eventId, value: JSON.stringify({ payload, error: error.message }) }]
        });
        
        await db.processedEvent.create({ data: { eventId, topic, status: 'FAILED' } });
      } else {

        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempts)));
      }
    }
  }
}