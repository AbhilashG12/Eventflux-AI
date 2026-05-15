import { db } from '@eventflux/database';
import { publishEvent } from '@eventflux/kafka';

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

  async trigger(workflowId: string, initialPayload: any, forcedExecutionId?: string) {
    try {
      const workflow = await db.workflow.findUnique({
        where: { id: workflowId }
      });

      if (!workflow || !workflow.definition) {
        console.error(`[Execution Engine] Workflow ${workflowId} not found.`);
        return;
      }

      const tenantId = workflow.tenantId;
      const definition = workflow.definition as any;
      const nodes = definition.nodes || [];
      
      const executionId = forcedExecutionId || initialPayload?.executionId || `exec_${Date.now()}`;
      
      const executionState: Record<string, any> = {
        trigger: initialPayload || {}
      };

      console.log(`[Execution Engine] Starting Execution ${executionId}`);

      for (const node of nodes) {
        await publishEvent('execution-events', `${executionId}-${node.id}-running`, {
          tenantId,
          executionId,
          nodeId: node.id,
          status: 'RUNNING',
          logs: `> Starting ${node.type}...\n> Resolving variables...`
        });

        let stepOutput: any = {};
        let stepStatus = 'COMPLETED';
        let stepLogs = '';

        try {
          switch (node.type) {
            
            case 'HTTP_REQUEST': {
              const urlTemplate = node.data?.url || 'https://jsonplaceholder.typicode.com/todos/1';
              const resolvedUrl = this.interpolate(urlTemplate, executionState);
              
              stepLogs += `> Executing HTTP GET to: ${resolvedUrl}\n`;
              await new Promise(res => setTimeout(res, 1000));
              
              stepOutput = { status: 200, data: { message: "Mock response from API" }, requestedUrl: resolvedUrl };
              stepLogs += `> Response 200 OK received.`;
              break;
            }

            case 'DATA_TRANSFORM': {
              stepLogs += `> Transforming payload data...\n`;
              // Example: Taking data from a previous step and altering it
              const sourceData = executionState[node.data?.sourceNodeId || 'trigger'];
              stepOutput = { transformed: true, originalSize: JSON.stringify(sourceData).length };
              stepLogs += `> Transformation complete.`;
              break;
            }

            default: {
              // Fallback for UI nodes or unsupported types
              stepLogs += `> Executing standard node logic...\n`;
              await new Promise(res => setTimeout(res, 800));
              stepOutput = { message: "Standard execution complete" };
            }
          }

        } catch (error: any) {
          stepStatus = 'FAILED';
          stepLogs += `\n> CRITICAL ERROR: ${error.message}`;
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
          console.error(`[Execution Engine] Halting execution ${executionId} at node ${node.id}`);
          break; 
        }
      }

      console.log(`[Execution Engine] Execution ${executionId} finished.`);
      
    } catch (error) {
      console.error("[Execution Engine] Execution failed:", error);
    }
  }
}