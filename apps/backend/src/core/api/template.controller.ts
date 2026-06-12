import { Request, Response } from 'express';
import { db } from '@eventflux/database';
import { v4 as uuidv4 } from 'uuid';

// Hardcoded templates for immediate UX value without needing database seeding
const TEMPLATES = [
  {
    id: 'tpl_lead_scorer',
    name: 'AI Lead Scorer & Routing',
    description: 'Intercepts a webhook, scores the lead using AI, and routes high-value leads to a Slack channel.',
    icon: 'Sparkles',
    definition: {
      nodes: [
        { id: 'trigger_1', type: 'TRIGGER', position: { x: 100, y: 200 }, data: { label: 'Lead Webhook', actionType: 'webhook_trigger' } },
        { id: 'ai_1', type: 'ACTION', position: { x: 400, y: 200 }, data: { label: 'Analyze Lead', actionType: 'ai_generate', config: { prompt: 'Score this lead from 1-100: {{trigger.payload}}' } } },
        { id: 'slack_1', type: 'ACTION', position: { x: 700, y: 200 }, data: { label: 'Notify Sales', actionType: 'slack_message', config: { message: 'High value lead detected! Score: {{ai_1.reply}}' } } }
      ],
      edges: [
        { id: 'e1', source: 'trigger_1', target: 'ai_1', type: 'smoothstep' },
        { id: 'e2', source: 'ai_1', target: 'slack_1', type: 'smoothstep' }
      ]
    }
  },
  {
    id: 'tpl_approval_flow',
    name: 'Human-in-the-Loop Approval',
    description: 'Requires a manager to approve a generated response before sending it to the client via HTTP.',
    icon: 'UserCheck',
    definition: {
      nodes: [
        { id: 'trigger_2', type: 'TRIGGER', position: { x: 100, y: 200 }, data: { label: 'Support Ticket', actionType: 'webhook_trigger' } },
        { id: 'ai_2', type: 'ACTION', position: { x: 400, y: 200 }, data: { label: 'Draft Response', actionType: 'ai_generate', config: { prompt: 'Draft a polite response to: {{trigger.message}}' } } },
        { id: 'approval_1', type: 'APPROVAL', position: { x: 700, y: 200 }, data: { label: 'Manager Review', actionType: 'human_approval' } },
        // 🚀 THE FIX: Updated to {{ai_2.reply}} to match the AI Executor's output key
        { id: 'http_1', type: 'ACTION', position: { x: 1000, y: 200 }, data: { label: 'Send Reply', actionType: 'http_request', config: { method: 'POST', url: 'https://webhook.site/YOUR-WEBHOOK-URL', body: '{"text": "{{ai_2.reply}}"}' } } }
      ],
      edges: [
        { id: 'e3', source: 'trigger_2', target: 'ai_2', type: 'smoothstep' },
        { id: 'e4', source: 'ai_2', target: 'approval_1', type: 'smoothstep' },
        { id: 'e5', source: 'approval_1', target: 'http_1', type: 'smoothstep' }
      ]
    }
  }
];

export const getTemplates = (req: Request, res: Response) => {
  res.status(200).json(TEMPLATES.map(t => ({ id: t.id, name: t.name, description: t.description, icon: t.icon })));
};

export const cloneTemplate = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const tenantId = (req as any).tenantId || 'default'; // Replace with real auth

  const template = TEMPLATES.find(t => t.id === id);
  if (!template) {
    res.status(404).json({ error: 'Template not found' });
    return;
  }

  try {
    const workflow = await db.workflow.create({
      data: {
        id: uuidv4(),
        tenantId,
        name: `${template.name} (Copy)`,
        definition: template.definition,
        status: 'DRAFT'
      }
    });

    res.status(200).json({ 
      success: true, 
      workflowId: workflow.id,
      definition: template.definition
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to clone template' });
  }
};