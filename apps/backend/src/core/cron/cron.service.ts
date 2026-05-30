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
        this.scheduleWorkflow(workflow.id, workflow.tenantId, workflow.cronSummary!);
      }
      
      logger.info(`⏰ CronService: Scheduled ${this.scheduledTasks.size} active cron workflows.`);
    } catch (error: any) {
      logger.error(error, 'Failed to initialize CronService');
    }
  }

  static scheduleWorkflow(workflowId: string, tenantId: string, cronSummary: string) {
    this.unscheduleWorkflow(workflowId);

    if (!cron.validate(cronSummary)) {
      logger.warn(`⚠️ Invalid cron expression for workflow ${workflowId}: ${cronSummary}`);
      return;
    }

    const task = cron.schedule(cronSummary, async () => {
      try {
        const eventId = `cron_${randomUUID()}`;
        
        await publishEvent('workflow-events', eventId, {
          workflowId: workflowId,
          tenantId: tenantId,
          initialPayload: { source: 'cron_scheduler', timestamp: new Date().toISOString() }
        });
        
        logger.info(`⏰ Cron triggered and published to Kafka: ${workflowId}`);
      } catch (error) {
        logger.error(error, `❌ Failed to publish cron event for workflow ${workflowId}`);
      }
    }, {
      timezone: "UTC" 
    });

    this.scheduledTasks.set(workflowId, task);
  }

  static unscheduleWorkflow(workflowId: string) {
    const existingTask = this.scheduledTasks.get(workflowId);
    if (existingTask) {
      existingTask.stop();
      this.scheduledTasks.delete(workflowId);
    }
  }
}