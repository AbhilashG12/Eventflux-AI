import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '@eventflux/database';
import { publishEvent } from '@eventflux/kafka';

export class WebhookController {
  async handleWebhook(req: Request, res: Response): Promise<any> {
    try {
      const workflowId = req.params.workflowId as string;
      const payload = {
        body: req.body,
        query: req.query,
        headers: req.headers,
      };

      const workflow = await db.workflow.findUnique({
        where: { id: workflowId },
        select: { id: true, tenantId: true, status: true, activeVersionId: true }
      });

      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      if (workflow.status !== 'PUBLISHED' || !workflow.activeVersionId) {
        return res.status(400).json({ error: "Workflow is not active" });
      }

      const eventId = `wh_${randomUUID()}`;

      await publishEvent('workflow-events', eventId, {
        workflowId: workflow.id,
        tenantId: workflow.tenantId,
        initialPayload: payload,
      });

      return res.status(202).json({
        success: true,
        message: "Webhook accepted and queued for execution",
        eventId
      });
    } catch (err: any) {
      return res.status(500).json({ error: "Internal Server Error processing webhook" });
    }
  }
}