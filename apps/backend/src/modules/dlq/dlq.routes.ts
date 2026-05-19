import { Router, Request, Response } from 'express';
import { db } from '@eventflux/database';
import { requireAuth, requireRole } from '../../core/middleware/auth.middleware.js';
import { publishEvent } from '@eventflux/kafka';

export const dlqRoutes: Router = Router();

dlqRoutes.get('/', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const allDlqItems = await db.deadLetterQueue.findMany({
      orderBy: { failedAt: 'desc' },
      include: { history: { orderBy: { replayedAt: 'desc' } } }
    });
    const tenantDlqItems = allDlqItems.filter(item => {
      const payload = item.payload as any;
      return payload && payload.tenantId === tenantId;
    });

    res.json(tenantDlqItems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch DLQ" });
  }
});

dlqRoutes.post('/:id/replay', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id as string; 
  const userId = (req as any).user?.id || 'system_admin';

  try {
    const dlqItem = await db.deadLetterQueue.findUnique({ where: { id } });
    
    if (!dlqItem) {
      return res.status(404).json({ error: "DLQ item not found" });
    }

    await publishEvent(dlqItem.topic, id, dlqItem.payload);

    await db.deadLetterQueue.update({
      where: { id },
      data: {
        replayed: true,
        replayedAt: new Date(),
        retryCount: { increment: 1 }
      }
    });

    await db.replayHistory.create({
      data: {
        dlqId: id,
        userId: userId,
        status: 'SUCCESS',
        message: 'Event re-queued to Kafka successfully'
      }
    });

    res.json({ success: true, message: "Event replayed successfully" });

  } catch (error: any) {
    await db.replayHistory.create({
      data: {
        dlqId: id,
        userId: userId,
        status: 'FAILED',
        message: error.message || 'Unknown failure during replay'
      }
    });
    res.status(500).json({ error: "Failed to replay event" });
  }
});