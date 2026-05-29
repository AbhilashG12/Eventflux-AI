import { Router } from 'express';
import { TenantController } from './tenant.controller.js';
import { requireAuth } from '../../../core/middleware/auth.middleware.js';

export const tenantRoutes: Router = Router();
const controller = new TenantController();

tenantRoutes.use(requireAuth);

tenantRoutes.get('/settings', (req, res) => controller.getSettings(req, res));
tenantRoutes.patch('/settings', (req, res) => controller.updateDetails(req, res));
tenantRoutes.post('/settings/rotate-key', (req, res) => controller.rotateApiKey(req, res));