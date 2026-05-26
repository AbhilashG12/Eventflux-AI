import { Router } from 'express';
import { WorkflowController } from './workflow.controller.js';
import { validateBody } from '../../../core/middleware/validate.middleware.js';
import { CreateWorkflowSchema } from './workflow.dto.js';
import { requireAuth } from '../../../core/middleware/auth.middleware.js';

const router = Router();
const controller = new WorkflowController();

router.use(requireAuth);

router.get('/', (req, res) => controller.getWorkflows(req, res));

router.post('/', validateBody(CreateWorkflowSchema), (req, res) => controller.createDraft(req, res));

router.patch('/:id/draft', (req, res) => controller.updateWorkflow(req, res));

router.post('/:id/publish', (req, res) => controller.publish(req, res));

router.post('/:id/execute', (req, res) => controller.trigger(req, res));

export const workflowRoutes: Router = router;