import { Router, Request, Response } from 'express';
import { db } from '@eventflux/database';
import { requireAuth } from '../../core/middleware/auth.middleware.js';

export const executionRoutes: Router = Router();

executionRoutes.get('/workflow/:workflowId', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const workflowId = req.params.workflowId as string;

    const executions = await db.execution.findMany({
      where: { 
        workflowVersion: {
          workflowId: workflowId
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    res.json(executions);
  } catch (err) {
    console.error("Failed to fetch executions:", err);
    res.status(500).json({ error: "Failed to fetch executions" });
  }
});

executionRoutes.get('/:executionId/logs', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const executionId = req.params.executionId as string;

    const logs = await db.executionLog.findMany({
      where: { executionId: executionId },
      orderBy: { timestamp: 'asc' }
    });
    
    res.json(logs);
  } catch (err) {
    console.error("Failed to fetch logs:", err);
    res.status(500).json({ error: "Failed to fetch execution logs" });
  }
});