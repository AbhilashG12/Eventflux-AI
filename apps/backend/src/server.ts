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
import { inviteRoutes } from './modules/tenant/interface/invite.routes.js';
import { executionRoutes } from './modules/execution/execution.routes.js';

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
app.use('/api/invites', inviteRoutes);

app.use('/api', requireAuth);
app.use('/api/executions',executionRoutes);
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
  
registerHandler('execution-events', async (payload) => {
  const execId = payload.executionId || (payload.eventName ? payload.eventName.split('-')[0] : null);
  const nodeId = payload.nodeId || (payload.eventName ? payload.eventName.split('-')[1] : null);
  const status = payload.status || (payload.eventName ? payload.eventName.split('-')[2] : null);
  const idempotentEventId = payload.eventId || payload.eventName || `${execId}-${nodeId}-${status}-${Date.now()}`;

  if (!execId || !nodeId || !status) {
    console.error("❌ [KAFKA] Malformed execution event payload:", payload);
    return;
  }

  await EventHardenerService.processIdempotent(idempotentEventId, 'execution-events', payload, async () => {
    try {
      await db.executionLog.create({
        data: {
          executionId: execId,
          nodeId: nodeId,
          status: status.toUpperCase(),
          message: `Step [${nodeId}] is ${status.toUpperCase()}`
        }
      });

      if (status.toLowerCase() === 'completed') {
        await db.execution.update({ 
          where: { id: execId }, 
          data: { status: 'COMPLETED', completedAt: new Date() }
        }).catch(() => {});
      } else if (status.toLowerCase() === 'failed') {
        await db.execution.update({ 
          where: { id: execId }, 
          data: { status: 'FAILED', completedAt: new Date() }
        }).catch(() => {});
      }
      console.log(`🔌 [WS] Broadcasting update for ${nodeId}: ${status}`);
      if (payload.tenantId) {
        wsManager.broadcastToTenant(payload.tenantId, 'workflow-node-update', { 
          nodeId, 
          status,
          timestamp: new Date()
        });
      }
    } catch (dbError) {
      console.error(`💥 [KAFKA] Error saving execution log:`, dbError);
    }
  });
});

registerHandler('execution-events', async (payload) => {
  const eventName = payload.eventName;
  
  await EventHardenerService.processIdempotent(eventName, 'execution-events', payload, async () => {
    const [execId, nodeId, status] = eventName.split('-'); 
    await db.executionLog.create({
      data: {
        executionId: execId,
        nodeId: nodeId,
        status: status.toUpperCase(),
        message: `Node ${nodeId} is ${status}`
      }
    });

    if (status === 'completed') {
      await db.execution.update({ where: { id: execId }, data: { status: 'COMPLETED', completedAt: new Date() }});
    }
    logger.info(`🔌 Broadcasting WS update: ${eventName}`);
    wsManager.broadcastToTenant(payload.tenantId, 'workflow-node-update', { 
      nodeId, 
      status,
      timestamp: new Date()
    });
  });
});

  await startConsumer();

  httpServer.listen(config.backend.port, () => {
    logger.info(`🚀 EventFlux Backend & WebSockets running on port ${config.backend.port}`);
  });
}

startSystem().catch(console.error);