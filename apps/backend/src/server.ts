import express from 'express';
import { createServer } from "http";
import cors from "cors";
import { config } from '@eventflux/config';
import { logger } from '@eventflux/logger';
import { requireAuth, requireRole } from './core/middleware/auth.middleware.js';
import { db } from '@eventflux/database';
import { authRoutes } from './modules/auth/interface/auth.routes.js';
import { workflowRoutes } from './modules/workflow/interface/workflow.routes.js';
import { producer, startConsumer, registerHandler } from '@eventflux/kafka';
import { ExecuteWorkflowUseCase } from './modules/workflow/application/execute.workflow.js';
import { WebSocketManager } from './core/websocket/ws.manager.js';
import { requestLogger } from './core/middleware/logger.middleware.js';
import { apiLimiter } from './core/middleware/ratelimiting.middleware.js';
import { EventHardenerService } from './core/events/event.hardener.js';
import { inviteRoutes } from './modules/tenant/interface/invite.routes.js';
import { executionRoutes } from './modules/execution/execution.routes.js';
import { dlqRoutes } from './modules/dlq/dlq.routes.js';
import { analyticsRoutes } from './modules/analytics/analytics.routes.js';
import { secretsRoutes } from "./modules/secrets/secrets.routes.js";
import {webhookRoutes} from "./modules/webhooks/webhooks.routes.js";
import {CronService} from "./core/cron/cron.service.js"

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

app.use('/api/webhooks', webhookRoutes);

app.use('/api', requireAuth);
app.use('/api/executions', executionRoutes);
app.use('/api/dlq', dlqRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use("/api/workflows", workflowRoutes);
app.use('/api/secrets', secretsRoutes);

app.get('/api/health', async (req, res) => {
  const workflowCount = await db.workflow.count({
    where: { tenantId: (req as any).tenantId }
  });
  
  res.json({ 
    status: 'ok', 
    tenant: (req as any).tenantId,
    workflows: workflowCount 
  });
});

app.get('/api/me', (req, res) => {
  res.json({ message: 'You are authenticated', user: (req as any).user });
});

app.delete('/api/tenant', requireRole(['ADMIN']), (req, res) => {
  res.json({ message: 'Tenant deletion requested', tenantId: (req as any).tenantId });
});

async function startSystem() {
  await producer.connect();

  registerHandler('workflow-events', async (payload) => {
    console.log(`\n📥 [KAFKA] Received trigger for workflow:`, payload.workflowId);
    const safeExecId = `exec_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    await EventHardenerService.processIdempotent(safeExecId, 'workflow-events', payload, async () => {
      try {
        console.log(`🚀 [KAFKA] Database processing started for: ${safeExecId}`);

        let latestVersion = await db.workflowVersion.findFirst({
          where: { workflowId: payload.workflowId },
          orderBy: { version: 'desc' }
        });

        if (!latestVersion) {
          console.log(`⚠️ [KAFKA] Auto-creating Version 1 for workflow: ${payload.workflowId}`);
          const parentWorkflow = await db.workflow.findUnique({ where: { id: payload.workflowId } });
          latestVersion = await db.workflowVersion.create({
            data: {
              workflowId: payload.workflowId,
              version: 1,
              definition: parentWorkflow?.definition || {} 
            }
          });
        }

        await db.execution.create({
          data: {
            id: safeExecId,
            workflowVersionId: latestVersion.id,
            status: 'RUNNING',
            startedAt: new Date()
          }
        });

        console.log(`✅ [KAFKA] Execution ${safeExecId} saved to database! UI should update NOW.`);
        
        setTimeout(() => {
          const enrichedPayload = {
            ...(payload.initialPayload || {}),
            executionId: safeExecId
          };

          executeUseCase.trigger(payload.workflowId, enrichedPayload).catch(async err => {
            console.error(`❌ [KAFKA] Execution failed: ${err.message}`);
            await db.execution.update({ 
              where: { id: safeExecId }, 
              data: { status: 'FAILED', completedAt: new Date() } 
            });
          });
        }, 0);

      } catch (dbError) {
        console.error(`💥 [KAFKA] Database error:`, dbError);
      }
    });
  });

 registerHandler('execution-events', async (payload) => {
    const execId = payload.executionId || (payload.eventName ? payload.eventName.split('-')[0] : null);
    const nodeId = payload.nodeId || (payload.eventName ? payload.eventName.split('-')[1] : null);
    const status = payload.status || (payload.eventName ? payload.eventName.split('-')[2] : null);

    const idempotentEventId = payload.eventId || payload.eventName || `${execId}-${nodeId}-${status}-${Date.now()}`;

    if (!execId || !nodeId || !status) {
      console.warn("⚠️ [KAFKA] Ignored malformed execution event:", payload);
      return;
    }

    await EventHardenerService.processIdempotent(idempotentEventId, 'execution-events', payload, async () => {
      try {
        let targetTenant = payload.tenantId;
        let currentStatus = null;
        
        if (execId) {
          const executionRecord = await db.execution.findUnique({
            where: { id: execId },
            include: { workflowVersion: { include: { workflow: true } } }
          });
          targetTenant = targetTenant || executionRecord?.workflowVersion?.workflow?.tenantId || 'default';
          currentStatus = executionRecord?.status;
        }

        if (currentStatus === 'CANCELLED' && status.toUpperCase() !== 'CANCELLED') {
          console.log(`🛑 [KAFKA] Ignoring trailing ${status.toUpperCase()} event for node [${nodeId}]. Execution was CANCELLED.`);
          return; 
        }

        await db.executionLog.create({
          data: {
            executionId: execId,
            nodeId: nodeId,
            status: status.toUpperCase(),
            message: `Step [${nodeId}] is ${status.toUpperCase()}`,
            output: payload.output ? (typeof payload.output === 'string' ? JSON.parse(payload.output) : payload.output) : undefined
          }
        });

        if (status.toLowerCase() === 'completed') {
          await db.execution.update({ 
            where: { id: execId }, 
            data: { status: 'COMPLETED', completedAt: new Date() }
          }).catch(() => {});
          wsManager.broadcastToTenant(targetTenant, 'analytics-pulse', { status: 'COMPLETED' });
        } else if (status.toLowerCase() === 'failed') {
          await db.execution.update({ 
            where: { id: execId }, 
            data: { status: 'FAILED', completedAt: new Date() }
          }).catch(() => {});
          wsManager.broadcastToTenant(targetTenant, 'analytics-pulse', { status: 'FAILED' });
        }

        wsManager.broadcastToTenant(targetTenant, 'workflow-node-update', { 
          executionId: execId,
          nodeId, 
          status,
          timestamp: new Date()
        });
      } catch (dbError) {
        console.error(`💥 [KAFKA] Error saving execution log:`, dbError);
      }
    });
  });

  await startConsumer();

  await CronService.init();

  httpServer.listen(config.backend.port, () => {
    logger.info(`🚀 EventFlux Backend & WebSockets running on port ${config.backend.port}`);
  });
}

startSystem().catch(console.error);