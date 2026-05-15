import { db } from '@eventflux/database';

export class EventHardenerService {
  static async processIdempotent<T>(
    eventId: string | undefined | null,
    topic: string,
    payload: T,
    processorFn: () => Promise<void>
  ) {
    const safeEventId = 
      eventId || 
      (payload as any)?.eventId || 
      (payload as any)?.eventName || 
      `fallback-${topic}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const alreadyProcessed = await db.processedEvent.findUnique({
      where: { eventId: safeEventId }
    });

    if (alreadyProcessed) {
      return;
    }

    try {
      await processorFn();

      await db.processedEvent.create({
        data: { 
          eventId: safeEventId, 
          topic,
          status: 'PROCESSED' 
        }
      });
    } catch (error: any) {
      await db.deadLetterQueue.create({
        data: {
          id: safeEventId,
          topic,
          payload: payload as any,
          error: error.message || 'Unknown execution failure'
        }
      });
    }
  }
}