import { Request, Response } from 'express';
import { SaveDraftUseCase } from '../application/save.draft.js';
import { PublishWorkflowUseCase } from '../application/publish.workflow.js';
import { ExecuteWorkflowUseCase } from '../application/execute.workflow.js';
import { error } from 'node:console';

export class WorkflowController {
  private saveDraftUseCase = new SaveDraftUseCase();
  private publishUseCase = new PublishWorkflowUseCase();
  private executeUseCase = new ExecuteWorkflowUseCase();

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

  async trigger(req:Request,res:Response){
    try{
      const {workflowId} = req.params as {workflowId : string} ;
      const payload = req.body;
      const result = await this.executeUseCase.trigger(workflowId,payload);
      res.status(202).json(result);
    }catch(err:any){
      res.status(400).json({error : err.message});
    }
  }
}