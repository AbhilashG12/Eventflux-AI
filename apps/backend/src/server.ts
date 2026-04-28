import express from 'express';
import { config } from '@eventflux/config';
import { logger } from '@eventflux/logger';
import { tenantMiddleware } from './core/middleware/tenant.js';
import { db } from '@eventflux/database';

const app = express();
app.use(express.json());

app.use('/api', tenantMiddleware);

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

app.listen(config.backend.port, () => {
  logger.info(`🚀 EventFlux Backend running on port ${config.backend.port}`);
});