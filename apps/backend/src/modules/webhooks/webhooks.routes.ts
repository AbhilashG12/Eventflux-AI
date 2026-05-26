import { Router } from 'express';
import { WebhookController } from './webhooks.controller.js';

const router = Router();
const controller = new WebhookController();

router.post('/:workflowId', (req, res) => controller.handleWebhook(req, res));
router.get('/:workflowId', (req, res) => controller.handleWebhook(req, res));

export const webhookRoutes: Router = router;