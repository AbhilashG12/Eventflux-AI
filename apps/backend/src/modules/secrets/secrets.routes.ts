import { Router } from 'express';
import { SecretsController } from './secrets.controller.js';
import { requireAuth } from '../../core/middleware/auth.middleware.js';

const router = Router();
const controller = new SecretsController();

router.use(requireAuth);

router.get('/', (req, res) => controller.listSecrets(req, res));
router.post('/', (req, res) => controller.createSecret(req, res));
router.delete('/:id', (req, res) => controller.deleteSecret(req, res));

export const secretsRoutes: Router = router;