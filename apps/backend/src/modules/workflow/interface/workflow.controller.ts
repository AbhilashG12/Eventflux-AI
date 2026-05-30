import { Request, Response } from 'express';
import { SaveDraftUseCase } from '../application/save.draft.js';
import { PublishWorkflowUseCase } from '../application/publish.workflow.js';
import { ExecuteWorkflowUseCase } from '../application/execute.workflow.js';
import { randomUUID } from 'crypto';
import { publishEvent } from '@eventflux/kafka';
import { db } from '@eventflux/database';
import { CronService } from '../../../core/cron/cron.service.js';

export class WorkflowController {
  private saveDraftUseCase = new SaveDraftUseCase();
  private publishUseCase = new PublishWorkflowUseCase();
  private executeUseCase = new ExecuteWorkflowUseCase();

  async getWorkflows(req: Request, res: Response) {
    try {
      const workflows = await db.workflow.findMany({
        where: { tenantId: (req as any).tenantId! },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(workflows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async createDraft(req: Request, res: Response) {
    try {
      const result = await this.saveDraftUseCase.execute((req as any).tenantId!, req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async updateWorkflow(req: Request, res: Response): Promise<any> {
    const id = req.params.id as string;
    const tenantId = (req as any).tenantId;

    // Safely parse either a { definition } object or raw { nodes, edges } 
    // coming directly from the React Flow frontend canvas.
    const definition = req.body.definition || {
      nodes: req.body.nodes || [],
      edges: req.body.edges || []
    };

    try {
      const workflow = await db.workflow.findFirst({
        where: { id, tenantId }
      });

      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      const updated = await db.workflow.update({
        where: { id },
        data: { 
          definition: definition as any,
          status: 'DRAFT'
        }
      });
      return res.json({ success: true, workflow: updated });
    } catch (error) {
      return res.status(500).json({ error: "Failed to save draft" });
    }
  }

  async publish(req: Request, res: Response): Promise<any> {
    const id = req.params.id as string;
    const tenantId = (req as any).tenantId;

    try {
      const workflow = await db.workflow.findFirst({
        where: { id, tenantId },
        include: { versions: { orderBy: { version: 'desc' }, take: 1 } }
      });

      if (!workflow || !workflow.definition) {
        return res.status(400).json({ error: "Cannot publish an empty workflow" });
      }

      const definition = workflow.definition as any;
      const nodes = definition.nodes || [];
      const triggerNode = nodes.find((n: any) => n.type === 'TRIGGER');

      let dbTriggerType: 'MANUAL' | 'WEBHOOK' | 'CRON' = 'MANUAL';
      let dbCronSummary = null;

      if (triggerNode) {
        const actionType = triggerNode.data?.actionType;
        if (actionType === 'webhook_trigger') dbTriggerType = 'WEBHOOK';
        if (actionType === 'cron_trigger') {
          dbTriggerType = 'CRON';
          dbCronSummary = triggerNode.data?.config?.cronString || null;
        }
      }

      const nextVersionNum = workflow.versions.length > 0 ? workflow.versions[0].version + 1 : 1;

      const result = await db.$transaction(async (tx) => {
        const newVersion = await tx.workflowVersion.create({
          data: {
            workflowId: id,
            version: nextVersionNum,
            definition: workflow.definition as any,
          }
        });
        await tx.workflow.update({
          where: { id },
          data: {
            activeVersionId: newVersion.id,
            status: 'PUBLISHED',
            triggerType: dbTriggerType,
            cronSummary: dbCronSummary
          }
        });

        return newVersion;
      });

      await CronService.reloadAll();

      return res.json({ 
        success: true, 
        message: `Published v${result.version} successfully!`,
        version: result 
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to publish workflow" });
    }
  }

  async trigger(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const payload = req.body;
      const eventId = randomUUID();
      
      await publishEvent('workflow-events', eventId, {
        workflowId: id,
        tenantId: (req as any).tenantId,
        initialPayload: payload,
      });

      res.status(202).json({ 
        message: "Workflow queued for execution", 
        eventId 
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}