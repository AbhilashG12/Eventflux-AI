import express from 'express';
import { createServer } from "http";
import cors from "cors"
import { config } from '@eventflux/config';
import { logger } from '@eventflux/logger';
import { requireAuth, requireRole } from './core/middleware/auth.middleware.js';
import { db } from '@eventflux/database';
import { authRoutes } from './modules/auth/interface/auth.routes.js';
import { workflowRoutes } from './modules/workflow/interface/workflow.routes.js';
import { producer, consumer, startConsumer, registerHandler } from '@eventflux/kafka';
import { ExecuteWorkflowUseCase } from './modules/workflow/application/execute.workflow.js';
import { WebSocketManager } from './core/websocket/ws.manager.js';
import { requestLogger } from './core/middleware/logger.middleware.js';
import { apiLimiter } from './core/middleware/ratelimiting.middleware.js';
import { EventHardenerService } from './core/events/event.hardener.js';

const executeUseCase = new ExecuteWorkflowUseCase();
const app = express();

const httpServer = createServer(app);
const wsManager = new WebSocketManager(httpServer);

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(apiLimiter);
app.use('/api/auth', authRoutes);
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
    const eventId = payload.executionId || `wf-${Date.now()}`;
    
    await EventHardenerService.processIdempotent(
      eventId,
      'workflow-events',
      payload,
      async () => {
        await executeUseCase.trigger(payload.workflowId, payload.initialPayload);
      }
    );
  });

  registerHandler('execution-events', async (payload) => {
    const eventId = `${payload.executionId}-${payload.nodeId}-${payload.status}`;
    
    await EventHardenerService.processIdempotent(
      eventId,
      'execution-events',
      payload,
      async () => {
        logger.info(`📡 Broadcasting WS update for Node: ${payload.nodeId}`);
        wsManager.broadcastToTenant(
          payload.tenantId, 
          'node_status_update', 
          payload
        );
      }
    );
  });

  await startConsumer();

  httpServer.listen(config.backend.port, () => {
    logger.info(`🚀 EventFlux Backend & WebSockets running on port ${config.backend.port}`);
  });
}

startSystem().catch(console.error);