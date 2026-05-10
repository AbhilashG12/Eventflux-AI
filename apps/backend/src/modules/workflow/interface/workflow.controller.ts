import { Request, Response } from 'express';
import { SaveDraftUseCase } from '../application/save.draft.js';
import { PublishWorkflowUseCase } from '../application/publish.workflow.js';

export class WorkflowController {
  private saveDraftUseCase = new SaveDraftUseCase();
  private publishUseCase = new PublishWorkflowUseCase();

  async createDraft(req: Request, res: Response) {
    try {
      const result = await this.saveDraftUseCase.execute(req.tenantId!, req.body);
      res.status(201).json(result);
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
}