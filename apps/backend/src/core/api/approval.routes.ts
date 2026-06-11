import { Router } from 'express';
import { resolveApproval,getPendingApprovals } from './approval.controller.js';

const router  = Router();
router.get('/pending', getPendingApprovals);
router.post('/:id/resolve', resolveApproval);

export const approvalRoutes : Router = router;