import { Request, Response } from 'express';
import { db } from '@eventflux/database';

export class ExecutionController {
  
  async getExecutionsByWorkflow(req: Request, res: Response): Promise<any> {
    try {
      const workflowId = req.params.workflowId as string;

      const executions = await db.execution.findMany({
        where: { 
          workflowVersion: {
            workflowId: workflowId,
            workflow: { tenantId: (req as any).tenantId }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      
      return res.json(executions);
    } catch (err) {
      console.error("Failed to fetch executions:", err);
      return res.status(500).json({ error: "Failed to fetch executions" });
    }
  }

  async getExecutionLogs(req: Request, res: Response): Promise<any> {
    try {
      const executionId = req.params.executionId as string;

      const logs = await db.executionLog.findMany({
        where: { executionId: executionId },
        orderBy: { timestamp: 'asc' }
      });
      
      return res.json(logs);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      return res.status(500).json({ error: "Failed to fetch execution logs" });
    }
  }

  async cancelExecution(req: Request, res: Response): Promise<any> {
    try {
      const executionId = req.params.executionId as string;
      const tenantId = (req as any).tenantId;

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

      await db.execution.update({
        where: { id: executionId },
        data: { 
          status: 'CANCELLED', 
          completedAt: new Date() 
        }
      });
      
      return res.json({ message: "Execution aborted successfully." });
    } catch (err) {
      console.error("Failed to cancel execution:", err);
      return res.status(500).json({ error: "Failed to cancel execution" });
    }
  }

  async getDashboardStats(req: Request, res: Response): Promise<any> {
    try {
      const tenantId = (req as any).tenantId;

      const statusCounts = await db.execution.groupBy({
        by: ['status'],
        where: { workflowVersion: { workflow: { tenantId } } },
        _count: { status: true },
      });

      let totalRuns = 0;
      let successfulRuns = 0;
      let failedRuns = 0;

      statusCounts.forEach(stat => {
        totalRuns += stat._count.status;
        if (stat.status === 'COMPLETED') successfulRuns += stat._count.status;
        if (stat.status === 'FAILED') failedRuns += stat._count.status;
      });

      const successRate = totalRuns > 0 ? ((successfulRuns / totalRuns) * 100).toFixed(1) : 100;

      const recentExecutions = await db.execution.findMany({
        where: { workflowVersion: { workflow: { tenantId } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          workflowVersion: { include: { workflow: { select: { name: true } } } }
        }
      });

      // Flatten the response so the frontend dashboard can easily read workflow.name
      const formattedExecutions = recentExecutions.map(exec => ({
        ...exec,
        workflow: { name: exec.workflowVersion.workflow.name }
      }));

      return res.status(200).json({
        stats: {
          totalRuns,
          successRate: Number(successRate),
          failedRuns
        },
        recentExecutions: formattedExecutions
      });
    } catch (error) {
      console.error("Dashboard Stats Error:", error);
      return res.status(500).json({ error: "Failed to load dashboard statistics" });
    }
  }
}