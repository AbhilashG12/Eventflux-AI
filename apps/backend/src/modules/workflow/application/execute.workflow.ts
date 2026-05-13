import { db } from '@eventflux/database';
import { publishEvent } from '@eventflux/kafka';

export class ExecuteWorkflowUseCase {
  async trigger(workflowId: string, initialPayload: any) {
    try {
      // 1. Fetch the live Canvas Draft we just saved to the database
      const workflow = await db.workflow.findUnique({
        where: { id: workflowId }
      });

      if (!workflow || !workflow.definition) {
        console.error(`[Execution Engine] Workflow ${workflowId} not found or has no definition.`);
        return;
      }

      const tenantId = workflow.tenantId;
      const definition = workflow.definition as any;
      const nodes = definition.nodes || [];
      
      const executionId = `exec_${Date.now()}`;
      console.log(`[Execution Engine] Starting Test Execution ${executionId} for Workflow ${workflowId}`);

      // 2. Traverse the DAG and process each node
      for (const node of nodes) {
        
        // 🟢 STEP A: Broadcast that the node is RUNNING
        await publishEvent('execution-events', `${executionId}-${node.id}-running`, {
          tenantId,
          executionId,
          nodeId: node.id,
          status: 'RUNNING',
          logs: `> Initializing ${node.data?.actionType || node.type}...\n> Fetching configurations...`
        });

        // ⏱️ SIMULATE HEAVY COMPUTE (e.g., waiting for Llama 3 API or HTTP Request)
        // This artificial 2.5s delay lets you watch the UI animate perfectly.
        await new Promise(resolve => setTimeout(resolve, 2500));

        // 🟢 STEP B: Broadcast that the node is COMPLETED
        await publishEvent('execution-events', `${executionId}-${node.id}-completed`, {
          tenantId,
          executionId,
          nodeId: node.id,
          status: 'COMPLETED',
          logs: `> Execution successful.\n> Payload passed to next step.`,
          output: { status: 200, message: "OK" }
        });
      }

      console.log(`[Execution Engine] Execution ${executionId} completed successfully.`);
      
    } catch (error) {
      console.error("[Execution Engine] Execution failed:", error);
    }
  }
}