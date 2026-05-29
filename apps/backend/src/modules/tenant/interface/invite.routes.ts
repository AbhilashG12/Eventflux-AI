import { Router } from 'express';
import { InviteController } from './invite.controller.js';
import { requireAuth, requireRole } from '../../../core/middleware/auth.middleware.js';

export const inviteRoutes: Router = Router();
const controller = new InviteController();

inviteRoutes.post('/', requireAuth, requireRole(['ADMIN']), (req, res) => controller.createInvite(req, res));
inviteRoutes.get('/:token', (req, res) => controller.validateInvite(req, res));