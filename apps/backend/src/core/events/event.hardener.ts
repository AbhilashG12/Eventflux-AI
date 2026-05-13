import { db } from '@eventflux/database';

export class EventHardenerService {
  static async processIdempotent<T>(
    eventId: string,
    topic: string,
    payload: T,
    processorFn: () => Promise<void>
  ) {
    const alreadyProcessed = await db.processedEvent.findUnique({
      where: { eventId }
    });

    if (alreadyProcessed) {
      return;
    }

    try {
      await processorFn();

      await db.processedEvent.create({
        data: { 
          eventId, 
          topic,
          status: 'PROCESSED' 
        }
      });
    } catch (error: any) {
      await db.deadLetterQueue.create({
        data: {
          id: eventId,
          topic,
          payload: payload as any,
          error: error.message || 'Unknown execution failure'
        }
      });
    }
  }
}