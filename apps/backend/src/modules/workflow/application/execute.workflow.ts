import { db } from '@eventflux/database';
import { publishEvent } from '@eventflux/kafka';
import { pluginRegistry } from '../../execution/registry.js';
import { ExecutionContext } from '../../execution/nodes/nodes.interface.js';

export class ExecuteWorkflowUseCase {

  private interpolate(text: string, state: Record<string, any>): string {
    if (typeof text !== 'string') return text;
    
    return text.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const keys = path.split('.');
      let current = state;
      for (const key of keys) {
        if (current[key] === undefined) return '';
        current = current[key];
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

      const context: ExecutionContext = {
        executionId,
        workflowId,
        tenantId,
        initialPayload: initialPayload || {},
        previousResults: executionState,
        secrets: {} 
      };

      for (const node of nodes) {
        await publishEvent('execution-events', `${executionId}-${node.id}-running`, {
          tenantId,
          executionId,
          nodeId: node.id,
          status: 'RUNNING'
        });

        let stepOutput: any = {};
        let stepStatus = 'COMPLETED';
        let stepLogs = '';

        try {
          const interpolatedNode = {
            ...node,
            data: this.interpolateNodeData(node.data || {}, executionState)
          };

          if (node.type === 'TRIGGER') {
            stepOutput = initialPayload || {};
          } else {
            const pluginType = node.data?.pluginType || node.type;
            const executor = pluginRegistry.getExecutor(pluginType);
            
            stepOutput = await executor.execute(interpolatedNode, context);
          }

        } catch (error: any) {
          stepStatus = 'FAILED';
          stepLogs += `\n> CRITICAL ERROR: ${error.message}`;
          console.error(`\n❌ [Execution Engine] Node ${node.id} FAILED:`, error.message);
        }
        
        executionState[node.id] = stepOutput;

        await publishEvent('execution-events', `${executionId}-${node.id}-${stepStatus.toLowerCase()}`, {
          tenantId,
          executionId,
          nodeId: node.id,
          status: stepStatus,
          logs: stepLogs,
          output: stepOutput
        });

        if (stepStatus === 'FAILED') {
          break; 
        }
      }
      
    } catch (error) {
      throw error;
    }
  }
}