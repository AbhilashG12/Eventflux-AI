import { Request, Response } from 'express';
import { SaveDraftUseCase } from '../application/save.draft.js';
import { PublishWorkflowUseCase } from '../application/publish.workflow.js';
import { ExecuteWorkflowUseCase } from '../application/execute.workflow.js';
import { randomUUID } from 'crypto';
import { publishEvent } from '@eventflux/kafka';
import { db } from '@eventflux/database';

export class WorkflowController {
  private saveDraftUseCase = new SaveDraftUseCase();
  private publishUseCase = new PublishWorkflowUseCase();
  private executeUseCase = new ExecuteWorkflowUseCase();

  async getWorkflows(req: Request, res: Response) {
    try {
      const workflows = await db.workflow.findMany({
        where: { tenantId: req.tenantId! },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(workflows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async createDraft(req: Request, res: Response) {
    try {
      const result = await this.saveDraftUseCase.execute(req.tenantId!, req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async updateWorkflow(req: Request, res: Response) {
    try {
      const id = req.params.id as string; 
      const { name, definition } = req.body;
      
      const updated = await db.workflow.updateMany({
        where: { id, tenantId: req.tenantId! },
        data: { 
          name, 
          definition 
        } 
      });

      if (updated.count === 0) {
        return res.status(404).json({ error: "Workflow not found or unauthorized" });
      }
      
      res.status(200).json({ message: "Workflow updated successfully" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async publish(req: Request, res: Response) {
    try {
      const workflowId = req.params.workflowId as string;
      const versionId = req.params.versionId as string;
      
      const result = await this.publishUseCase.execute(req.tenantId!, workflowId, versionId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async trigger(req: Request, res: Response) {
    try {
      const { workflowId } = req.params;
      const payload = req.body;
      const eventId = randomUUID();
      
      await publishEvent('workflow-events', eventId, {
        workflowId,
        tenantId: req.tenantId,
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