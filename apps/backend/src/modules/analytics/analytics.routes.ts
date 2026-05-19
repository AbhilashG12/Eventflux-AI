import { Router, Request, Response } from 'express';
import { db } from '@eventflux/database';
import { requireAuth } from '../../core/middleware/auth.middleware.js';

export const analyticsRoutes: Router = Router();

analyticsRoutes.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;

    const workflows = await db.workflow.count({ where: { tenantId } });

    const executions = await db.execution.findMany({
      where: {
        workflowVersion: {
          workflow: { tenantId }
        }
      },
      select: {
        status: true,
        startedAt: true,
        completedAt: true,
      },
      orderBy: { startedAt: 'asc' }
    });

    const totalRuns = executions.length;
    let successfulRuns = 0;
    let failedRuns = 0;
    let totalDurationMs = 0;
    let completedCount = 0;

    const chartDataMap = new Map<string, { time: string, success: number, failed: number }>();

    executions.forEach(exec => {
      if (exec.status === 'COMPLETED') successfulRuns++;
      if (exec.status === 'FAILED') failedRuns++;

      if (exec.completedAt && exec.startedAt) {
        totalDurationMs += (exec.completedAt.getTime() - exec.startedAt.getTime());
        completedCount++;
      }
      const validDate = exec.startedAt ? new Date(exec.startedAt) : new Date();
      const timeKey = validDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      if (!chartDataMap.has(timeKey)) {
        chartDataMap.set(timeKey, { time: timeKey, success: 0, failed: 0 });
      }
      
      const entry = chartDataMap.get(timeKey)!;
      if (exec.status === 'COMPLETED') entry.success++;
      if (exec.status === 'FAILED') entry.failed++;
    });

    const successRate = totalRuns === 0 ? 0 : ((successfulRuns / totalRuns) * 100).toFixed(1);
    const avgDuration = completedCount === 0 ? 0 : (totalDurationMs / completedCount / 1000).toFixed(2);

    res.json({
      metrics: {
        totalRuns,
        successRate: Number(successRate),
        failedRuns,
        avgDuration: Number(avgDuration),
        activeWorkflows: workflows
      },
      chartData: Array.from(chartDataMap.values()).slice(-20) // Last 20 data points
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});