import { Router } from 'express';
import { WorkflowController } from './workflow.controller.js';

const router = Router();
const controller = new WorkflowController();

router.post('/', (req, res) => controller.createDraft(req, res));
router.post('/:workflowId/versions/:versionId/publish', (req, res) => controller.publish(req, res));
router.post('/:workflowId/trigger',(req,res)=>controller.trigger(req,res));

export const workflowRoutes: Router = router;