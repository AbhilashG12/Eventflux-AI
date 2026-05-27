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
          workflowId: workflowId,
          workflow : {tenantId : (req as any).tenantId}
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

// 🔥 NEW: Execution Kill Switch
executionRoutes.post('/:executionId/cancel', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const executionId = req.params.executionId as string;
    const tenantId = (req as any).tenantId;

    // 1. Verify the execution exists and belongs to this tenant
    const execution = await db.execution.findUnique({
      where: { id: executionId },
      include: { workflowVersion: { include: { workflow: true } } }
    });

    if (!execution || execution.workflowVersion.workflow.tenantId !== tenantId) {
      return res.status(404).json({ error: "Execution not found or unauthorized" });
    }

    if (execution.status !== 'RUNNING') {
      return res.status(400).json({ error: `Cannot cancel execution that is already ${execution.status}` });
    }

    // 2. Mark it as CANCELLED in the database
    await db.execution.update({
      where: { id: executionId },
      data: { 
        status: 'CANCELLED', 
        completedAt: new Date() 
      }
    });

    // Optional: If you want instant UI updates, you can broadcast the cancellation via WebSockets here.
    
    res.json({ message: "Execution aborted successfully." });
  } catch (err) {
    console.error("Failed to cancel execution:", err);
    res.status(500).json({ error: "Failed to cancel execution" });
  }
});