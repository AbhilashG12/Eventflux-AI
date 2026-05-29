import { Router } from 'express';
import { ExecutionController } from './execution.controller.js';
import { requireAuth } from '../../core/middleware/auth.middleware.js';

export const executionRoutes: Router = Router();
const controller = new ExecutionController();
executionRoutes.use(requireAuth);
executionRoutes.get('/dashboard', (req, res) => controller.getDashboardStats(req, res));

executionRoutes.get('/workflow/:workflowId', (req, res) => controller.getExecutionsByWorkflow(req, res));
executionRoutes.get('/:executionId/logs', (req, res) => controller.getExecutionLogs(req, res));
executionRoutes.post('/:executionId/cancel', (req, res) => controller.cancelExecution(req, res));