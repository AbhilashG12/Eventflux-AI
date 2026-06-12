import { db } from '@eventflux/database';
import { publishEvent } from '@eventflux/kafka';
import { pluginRegistry } from '../../execution/registry.js';
import { ExecutionContext } from '../../execution/nodes/nodes.interface.js';
import { decryptSecret } from "../../../core/utils/crypto.utils.js";

export class ExecuteWorkflowUseCase {
  
  // ---------------------------------------------------------------------------
  // INTERPOLATION LOGIC (NOW WITH DEBUG SUPERPOWERS 🦸‍♂️)
  // ---------------------------------------------------------------------------
  private interpolate(text: string, state: Record<string, any>): string {
    if (typeof text !== 'string') return text;
    
    return text.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const cleanPath = path.trim();
      const keys = cleanPath.split('.'); 
      let current: any = state;
      
      for (const key of keys) {
        if (current === undefined || current === null) {
          console.log(`⚠️ [Interpolation] Warning: Path '{{${cleanPath}}}' failed at '${key}'. Returning empty string.`);
          return '';
        }
        current = current[key];
      }
      
      console.log(`✨ [Interpolation] Resolved '{{${cleanPath}}}' ->`, typeof current === 'string' ? `"${current.substring(0, 30)}..."` : current);
      
      if (typeof current === 'string') {
        return current
          .replace(/\\/g, '\\\\') 
          .replace(/"/g, '\\"')   
          .replace(/\n/g, '\\n')  
          .replace(/\r/g, '\\r'); 
      }
      
      return current !== undefined ? String(current) : '';
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

  // ---------------------------------------------------------------------------
  // CORE ENGINE LOGIC
  // ---------------------------------------------------------------------------
  async trigger(workflowId: string, initialPayload: any, forcedExecutionId?: string) {
    try {
      console.log(`\n📥 [KAFKA] Received trigger for workflow: ${workflowId}`);

      const workflow = await db.workflow.findUnique({
        where: { id: workflowId }
      });

      if (!workflow || !workflow.definition) {
        throw new Error(`Workflow ${workflowId} not found or has no definition.`);
      }

      const tenantId = workflow.tenantId;
      const definition = workflow.definition as any;
      const nodes = definition.nodes || [];
      const edges = definition.edges || [];
      
      const executionId = forcedExecutionId || initialPayload?.executionId || `exec_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      const executionState: Record<string, any> = {
        trigger: initialPayload || {}
      };
      
      const triggerNode = nodes.find((n: any) => n.type === 'TRIGGER');
      if (triggerNode) {
        executionState[triggerNode.id] = initialPayload || {};
      }

      try {
        await db.execution.update({
          where: { id: executionId },
          data: { status: 'RUNNING' }
        });
      } catch (e) {}
      
      console.log(`✅ [KAFKA] Execution ${executionId} running! UI should update NOW.`);

      if (triggerNode) {
          await this.publishStatus(tenantId, executionId, triggerNode.id, 'running');
          await this.publishStatus(tenantId, executionId, triggerNode.id, 'completed');
      }

      await this.runDag(nodes, edges, executionState, executionId, tenantId, workflowId);

    } catch (error: any) {
      console.error(`❌ [KAFKA] Execution failed: ${error.message}`);
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // RESUME LOGIC
  // ---------------------------------------------------------------------------
  async resume(executionId: string, actionPayload: any) {
    console.log(`\n▶️ [Engine] Resuming paused execution: ${executionId}`);

    const approvalReq = await (db as any).approvalRequest.findFirst({
        where: { executionId },
        orderBy: { requestedAt: 'desc' }
    });

    if (!approvalReq) throw new Error(`Approval Request for Execution ${executionId} not found`);

    const workflow = await db.workflow.findUnique({
        where: { id: approvalReq.workflowId }
    });

    if (!workflow) throw new Error(`Workflow not found`);

    const nodes = (workflow.definition as any).nodes || [];
    const edges = (workflow.definition as any).edges || [];
    
    let state = approvalReq.contextData;
    if (typeof state === 'string') {
        try { state = JSON.parse(state); } catch(e) { state = {}; }
    }
    state = state || { trigger: {} };

    const approvalNode = nodes.find((n: any) => n.type === 'APPROVAL' || n.data?.actionType === 'human_approval');
    if (approvalNode) {
        state[approvalNode.id] = { status: 'APPROVED', ...actionPayload };
        console.log(`✅ [Engine] Approval node [${approvalNode.id}] marked as APPROVED.`);
        await this.publishStatus(workflow.tenantId, executionId, approvalNode.id, 'completed');
    }

    await db.execution.update({
        where: { id: executionId },
        data: { status: 'RUNNING' }
    });

    await this.runDag(nodes, edges, state, executionId, workflow.tenantId, workflow.id);
  }

  // ---------------------------------------------------------------------------
  // DAG LOOP EXECUTOR
  // ---------------------------------------------------------------------------
  private async runDag(nodes: any[], edges: any[], state: Record<string, any>, executionId: string, tenantId: string, workflowId: string) {
      let decryptedSecrets: Record<string, string> = {};
      
      try {
        const encryptedSecrets = await (db as any).tenantSecret.findMany({ where: { tenantId } });
        for (const secret of encryptedSecrets) {
          try {
            decryptedSecrets[secret.keyName] = decryptSecret(secret.value);
          } catch (e) {}
        }
      } catch (err) {}

      const context: ExecutionContext = {
        executionId,
        workflowId,
        tenantId,
        initialPayload: state.trigger || {},
        previousResults: state,
        secrets: decryptedSecrets
      };

      const completedNodes = new Set<string>(Object.keys(state));
      let hasPendingNodes = true;

      while (hasPendingNodes) {
         const availableNodes = nodes.filter(node => {
            if (completedNodes.has(node.id)) return false; 
            const incomingEdges = edges.filter((e: any) => e.target === node.id);
            return incomingEdges.every((e: any) => completedNodes.has(e.source));
         });

         if (availableNodes.length === 0) {
             hasPendingNodes = false;
             break;
         }

         for (const node of availableNodes) {
             const preCheck = await db.execution.findUnique({ where: { id: executionId }, select: { status: true } });
             if (preCheck?.status === 'CANCELLED') return;

             if (node.type === 'APPROVAL' || node.data?.actionType === 'human_approval') {
                 console.log(`⏸️ [Engine] Workflow paused at node: ${node.id}. Awaiting human approval.`);
                 
                 await (db as any).approvalRequest.create({
                    data: {
                        executionId: executionId,
                        workflowId: workflowId,
                        nodeId: node.id,
                        contextData: state, 
                        status: 'PENDING'
                    }
                 });

                 await db.execution.update({ 
                   where: { id: executionId }, 
                   data: { status: 'PAUSED' } 
                 });

                 await this.publishStatus(tenantId, executionId, node.id, 'paused');
                 return; 
             }

             await this.publishStatus(tenantId, executionId, node.id, 'running');

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
                         data: this.interpolateNodeData(node.data || {}, state)
                     };

                     const pluginType = node.data?.actionType || node.data?.pluginType || node.type;
                     const executor = pluginRegistry.getExecutor(pluginType);

                     stepOutput = await executor.execute(interpolatedNode, context);
                     success = true;
                 } catch (error: any) {
                     attempt++;
                     if (attempt <= maxRetries) {
                         await publishEvent('execution-events', `${executionId}-${node.id}-retrying-${attempt}`, {
                             tenantId, executionId, nodeId: node.id, status: 'RETRYING',
                             logs: `Attempt ${attempt}/${maxRetries} failed: ${error.message}. Retrying in ${retryDelayMs}ms...`
                         });
                         await new Promise(resolve => setTimeout(resolve, retryDelayMs));
                     } else {
                         stepStatus = 'FAILED';
                         stepLogs += `\n> CRITICAL ERROR: ${error.message || String(error)} (Failed after ${maxRetries} retries)`;
                         stepOutput = { error: error.message || "Unknown error" };
                     }
                 }
             }

             if (stepStatus === 'CANCELLED') return;

             // 🚀 DEBUG LOG: See EXACTLY what the AI (or any node) generated!
             console.log(`💡 [Engine] Node [${node.id}] finished. Output:`, stepOutput);

             state[node.id] = stepOutput;
             completedNodes.add(node.id);

             await publishEvent('execution-events', `${executionId}-${node.id}-${stepStatus.toLowerCase()}`, {
                 tenantId, executionId, nodeId: node.id, status: stepStatus, logs: stepLogs, output: stepOutput
             });

             if (stepStatus === 'FAILED') {
                 throw new Error(`Node [${node.id}] failed completely: ${stepLogs.trim()}`);
             }
         }
      }

      const finalCheck = await db.execution.findUnique({ where: { id: executionId }, select: { status: true } });
      if (finalCheck?.status !== 'CANCELLED' && finalCheck?.status !== 'FAILED' && finalCheck?.status !== 'PAUSED') {
          await db.execution.update({
              where: { id: executionId },
              data: { status: 'COMPLETED', completedAt: new Date() }
          });
          console.log(`🏁 [Engine] Execution ${executionId} COMPLETED successfully!`);
      }
  }

  private async publishStatus(tenantId: string, executionId: string, nodeId: string, status: string) {
      try {
          await publishEvent('execution-events', `${executionId}-${nodeId}-${status}`, {
              tenantId, executionId, nodeId, status: status.toUpperCase()
          });
      } catch (e) { }
  }
}