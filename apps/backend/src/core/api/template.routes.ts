import { Router } from 'express';
import { getTemplates, cloneTemplate } from './template.controller.js';

const router = Router();
router.get('/', getTemplates);
router.post('/:id/clone', cloneTemplate);
export const templateRoutes : Router = router;
