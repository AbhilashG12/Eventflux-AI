import { Router } from 'express';
import { WorkflowController } from './workflow.controller.js';
import { validateBody } from '../../../core/middleware/validate.middleware.js';
import { CreateWorkflowSchema } from './workflow.dto.js';


const router = Router();
const controller = new WorkflowController();

router.post('/', validateBody(CreateWorkflowSchema), (req, res) => controller.createDraft(req, res));
router.post('/:workflowId/versions/:versionId/publish', (req, res) => controller.publish(req, res));
router.post('/:workflowId/trigger',(req,res)=>controller.trigger(req,res));


export const workflowRoutes: Router = router;