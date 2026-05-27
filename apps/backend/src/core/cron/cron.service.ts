import cron from 'node-cron';
import { db } from '@eventflux/database';
import { publishEvent } from '@eventflux/kafka';
import { randomUUID } from 'crypto';
import { logger } from '@eventflux/logger';

export class CronService {
  private static scheduledTasks: Map<string, cron.ScheduledTask> = new Map();

  static async init() {
    await this.reloadAll();
  }

  static async reloadAll() {
    this.scheduledTasks.forEach(task => task.stop());
    this.scheduledTasks.clear();

    try {
      const cronWorkflows = await db.workflow.findMany({
        where: {
          status: 'PUBLISHED',
          triggerType: 'CRON',
          cronSummary: { not: null }
        }
      });

      for (const workflow of cronWorkflows) {
        if (workflow.cronSummary && cron.validate(workflow.cronSummary)) {
          const task = cron.schedule(workflow.cronSummary, async () => {
            const eventId = `cron_${randomUUID()}`;
            
            await publishEvent('workflow-events', eventId, {
              workflowId: workflow.id,
              tenantId: workflow.tenantId,
              initialPayload: { source: 'cron_scheduler', timestamp: new Date().toISOString() }
            });
            
          });
          
          this.scheduledTasks.set(workflow.id, task);
        }
      }
      
      logger.info(`⏰ CronService: Scheduled ${this.scheduledTasks.size} active cron workflows.`);
    } catch (error: any) {
      logger.error(error, 'Failed to initialize CronService');
    }
  }
}