import express from 'express';
import { config } from '@eventflux/config';
import { logger } from '@eventflux/logger';
import { requireAuth, requireRole } from './core/middleware/auth.middleware.js';
import { db } from '@eventflux/database';
import { authRoutes } from './modules/auth/interface/auth.routes.js';
import { workflowRoutes } from './modules/workflow/interface/workflow.routes.js';
import { producer, consumer, startConsumer, registerHandler } from '@eventflux/kafka';
import { ExecuteWorkflowUseCase } from './modules/workflow/application/execute.workflow.js';

const executeUseCase = new ExecuteWorkflowUseCase();
const app = express();

app.use(express.json());

app.use('/auth', authRoutes);

app.use('/api', requireAuth);

app.get('/api/health', async (req, res) => {
  const workflowCount = await db.workflow.count({
    where: { tenantId: req.tenantId }
  });
  
  res.json({ 
    status: 'ok', 
    tenant: req.tenantId,
    workflows: workflowCount 
  });
});

app.use("/api/workflows", workflowRoutes);

app.get('/api/me', (req, res) => {
  res.json({ message: 'You are authenticated', user: req.user });
});

app.delete('/api/tenant', requireRole(['ADMIN']), (req, res) => {
  res.json({ message: 'Tenant deletion requested', tenantId: req.tenantId });
});

async function startSystem() {
  await producer.connect();
  
  registerHandler('workflow-events', async (payload) => {
    await executeUseCase.trigger(payload.workflowId, payload.initialPayload);
  });

  await startConsumer();

  app.listen(config.backend.port, () => {
    logger.info(`🚀 EventFlux Backend running on port ${config.backend.port}`);
  });
}

startSystem().catch(console.error);