import { Request, Response } from 'express';
import { db } from '@eventflux/database';
import { publishEvent } from '@eventflux/kafka';

export class EventsController {
  async replayDeadLetter(req: Request, res: Response) {
    const dlqId = req.params.dlqId as string;

    const deadLetter = await db.deadLetterQueue.findUnique({
      where: { id: dlqId }
    });

    if (!deadLetter || deadLetter.replayed) {
      return res.status(404).json({ error: "DLQ record not found or already replayed" });
    }

    await publishEvent(deadLetter.topic, deadLetter.id, deadLetter.payload);

    await db.deadLetterQueue.update({
      where: { id: dlqId },
      data: { replayed: true, replayedAt: new Date() }
    });

    return res.status(200).json({ message: "Event successfully re-queued", dlqId });
  }

  async getDeadLetters(req: Request, res: Response) {
    const letters = await db.deadLetterQueue.findMany({
      where: { replayed: false },
      orderBy: { failedAt: 'desc' }
    });
    return res.json(letters);
  }
}