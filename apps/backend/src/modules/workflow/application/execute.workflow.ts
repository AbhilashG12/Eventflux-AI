import { db } from '@eventflux/database';
import { publishEvent } from '@eventflux/kafka';
import { pluginRegistry } from '../../execution/registry.js';
import { ExecutionContext } from '../../execution/nodes/nodes.interface.js';
import { decryptSecret } from "../../../core/utils/crypto.utils.js";

export class ExecuteWorkflowUseCase {
  private interpolate(text: string, state: Record<string, any>): string {
    if (typeof text !== 'string') return text;
    
    return text.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const keys = path.split('.');
      let current: any = state;
      for (const key of keys) {
        if (current[key] === undefined) return '';
        current = current[key];
      }
      
      if (typeof current === 'string') {
        return current
          .replace(/\\/g, '\\\\') 
          .replace(/"/g, '\\"')   
          .replace(/\n/g, '\\n')  
          .replace(/\r/g, '\\r'); 
      }
      
      return String(current);
    });
  }

  private interpolateNodeData(data: any, state: Record<string, any>): any {
    if (typeof data === 'string') return this.interpolate(data, state);
    if (Array.isArray(data)) return data.map(item => this.interpolateNodeData(item, state));
    if (data !== null && typeof data === 'object') {
      const result: any = {};
      for (const key in data) {
        result[key] = this.interpolateNodeData(data[key], state);
      }
      return result;
    }
    return data;
  }

  async trigger(workflowId: string, initialPayload: any, forcedExecutionId?: string) {
    try {
      const workflow = await db.workflow.findUnique({
        where: { id: workflowId }
      });

      if (!workflow || !workflow.definition) {
        return;
      }

      const tenantId = workflow.tenantId;
      const definition = workflow.definition as any;
      const nodes = definition.nodes || [];
      
      const executionId = forcedExecutionId || initialPayload?.executionId || `exec_${Date.now()}`;
      
      const executionState: Record<string, any> = {
        trigger: initialPayload || {}
      };
      
      let decryptedSecrets: Record<string, string> = {};
      
      try {
        const encryptedSecrets = await (db as any).tenantSecret.findMany({
          where: { tenantId }
        });

        for (const secret of encryptedSecrets) {
          try {
            decryptedSecrets[secret.keyName] = decryptSecret(secret.value);
          } catch (e) {
            console.error(`💥 Failed to decrypt secret: ${secret.keyName}`);
          }
        }
      } catch (err) {
      }

      const context: ExecutionContext = {
        executionId,
        workflowId,
        tenantId,
        initialPayload: initialPayload || {},
        previousResults: executionState,
        secrets: decryptedSecrets
      };

      for (const node of nodes) {
        const preCheck = await db.execution.findUnique({ where: { id: executionId }, select: { status: true } });
        if (preCheck?.status === 'CANCELLED') {
          break;
        }

        if (node.type === 'APPROVAL') {
          await db.execution.update({
            where: { id: executionId },
            data: { status: 'PAUSED' }
          });

          await (db as any).approvalRequest.create({
            data: {
              executionId: executionId,
              workflowId: workflowId,
              nodeId: node.id,
              contextData: executionState
            }
          });

          await publishEvent('execution-events', `${executionId}-${node.id}-paused`, {
            tenantId,
            executionId,
            nodeId: node.id,
            status: 'PAUSED'
          });

          return { status: 'PAUSED', reason: 'Awaiting human approval' };
        }

        await publishEvent('execution-events', `${executionId}-${node.id}-running`, {
          tenantId,
          executionId,
          nodeId: node.id,
          status: 'RUNNING'
        });

        let stepOutput: any = {};
        let stepStatus = 'COMPLETED';
        let stepLogs = '';

        const maxRetries = Number(node.data?.config?.maxRetries) || 0;
        const retryDelayMs = Number(node.data?.config?.retryDelayMs) || 2000;
        
        let attempt = 0;
        let success = false;

        while (attempt <= maxRetries && !success) {
          try {
            const interpolatedNode = {
              ...node,
              data: this.interpolateNodeData(node.data || {}, executionState)
            };

            if (node.type === 'TRIGGER') {
              stepOutput = initialPayload || {};
            } else {
              const pluginType = node.data?.actionType || node.data?.pluginType || node.type;
              const executor = pluginRegistry.getExecutor(pluginType);

              stepOutput = await executor.execute(interpolatedNode, context);
            }
            success = true;
          } catch (error: any) {
            attempt++;
            if (attempt <= maxRetries) {
              await publishEvent('execution-events', `${executionId}-${node.id}-retrying-${attempt}`, {
                tenantId,
                executionId,
                nodeId: node.id,
                status: 'RETRYING',
                logs: `Attempt ${attempt}/${maxRetries} failed: ${error.message}. Retrying in ${retryDelayMs}ms...`
              });

              await new Promise(resolve => setTimeout(resolve, retryDelayMs));

              const retryCheck = await db.execution.findUnique({ where: { id: executionId }, select: { status: true } });
              if (retryCheck?.status === 'CANCELLED') {
                stepStatus = 'CANCELLED';
                break;
              }
            } else {
              stepStatus = 'FAILED';
              let errorMessage = "Unknown network failure";
              if (error?.cause?.code) {
                errorMessage = error.cause.code;
              } else if (error?.cause?.message) {
                errorMessage = error.cause.message;
              } else if (error?.message) {
                errorMessage = error.message; 
              } else {
                errorMessage = String(error);
              }
              stepLogs += `\n> CRITICAL ERROR: ${errorMessage} (Failed after ${maxRetries} retries)`;
              
              stepOutput = {
                error: error.message || "Unknown error",
                status: error.response?.status || 500,
                data: error.response?.data || null
              };
            }
          }
        }

        if (stepStatus === 'CANCELLED') {
          break;
        }

        const postCheck = await db.execution.findUnique({ where: { id: executionId }, select: { status: true } });
        if (postCheck?.status === 'CANCELLED') {
          break;
        }

        executionState[node.id] = stepOutput;

        if (node.data?.actionType === 'ai_generate') {
            executionState['groq'] = stepOutput;
        }

        await publishEvent('execution-events', `${executionId}-${node.id}-${stepStatus.toLowerCase()}`, {
          tenantId,
          executionId,
          nodeId: node.id,
          status: stepStatus,
          logs: stepLogs,
          output: stepOutput
        });

        if (stepStatus === 'FAILED') {
          throw new Error(`Node [${node.id}] failed completely: ${stepLogs.trim()}`);
        }
      }
      
      const finalCheck = await db.execution.findUnique({ where: { id: executionId }, select: { status: true } });
      if (finalCheck?.status !== 'CANCELLED' && finalCheck?.status !== 'FAILED' && finalCheck?.status !== 'PAUSED') {
        await db.execution.update({
          where: { id: executionId },
          data: { status: 'COMPLETED', completedAt: new Date() }
        });
      }

    } catch (error) {
      throw error;
    }
  }
}