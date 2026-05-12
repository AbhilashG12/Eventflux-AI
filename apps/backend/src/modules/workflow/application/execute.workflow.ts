import { db } from '@eventflux/database';
import { ActionRegistry } from '../domain/action.registry.js';
import { DagDefinition } from '../domain/dag.validator.js';
import { publishEvent } from '@eventflux/kafka';

export class ExecuteWorkflowUseCase {
  async trigger(workflowId: string, initialPayload: any) {
    const version = await db.workflowVersion.findFirst({
      where: { workflowId, status: 'PUBLISHED' }
    });

    if (!version) throw new Error("No published version found for this workflow.");

    const execution = await db.execution.create({
      data: {
        workflowVersionId: version.id,
        status: 'RUNNING',
        startedAt: new Date(),
      }
    });

    this.runEngine(execution.id, version.definition as unknown as DagDefinition, initialPayload)
      .catch(err => console.error(`CRITICAL ENGINE FAILURE: ${err.message}`));

    return { executionId: execution.id, status: 'RUNNING' };
  }

  private async runEngine(executionId: string, dag: DagDefinition, context: any) {
    try {
      const targetNodeIds = new Set(dag.edges.map(e => e.target));
      const startNodes = dag.nodes.filter(n => !targetNodeIds.has(n.id));

      let currentContext = { ...context };

      for (const node of startNodes) {
        await this.executeNodeRecursive(executionId, node.id, dag, currentContext);
      }
      
      await db.execution.update({
        where: { id: executionId },
        data: { status: 'COMPLETED', completedAt: new Date() }
      });
    } catch (error: any) {
      await db.execution.update({
        where: { id: executionId },
        data: { status: 'FAILED', completedAt: new Date(), logs: { fatalError: error.message } }
      });
    }
  }

  private async executeNodeRecursive(executionId: string, nodeId: string, dag: DagDefinition, context: any) {
    const node = dag.nodes.find(n => n.id === nodeId);
    if (!node) return;

    await db.executionStep.create({
      data: { executionId, nodeId, status: 'RUNNING', startedAt: new Date() }
    });

    let result;
    let attempts = 0;
    const maxRetries = 3;

    while (attempts < maxRetries) {
      if (node.type === 'TRIGGER') {
        result = { success: true, data: context };
        break;
      } else {
        result = await ActionRegistry.execute(node.data.action, context, node.data.config);
        if (result.success) break;
      }
      attempts++;
      await new Promise(r => setTimeout(r, 1000 * attempts));
    }

    if (!result || !result.success) {
      await db.executionStep.update({
        where: { executionId_nodeId: { executionId, nodeId } },
        data: { status: 'FAILED', error: result?.error || 'Max retries exceeded', completedAt: new Date() }
      });
      
      await publishEvent('execution-events', executionId, {
        tenantId: context.tenantId,
        executionId,
        nodeId,
        status: 'FAILED',
        error: result?.error
      });
      
      throw new Error(`Execution failed at node ${nodeId}: ${result?.error}`);
    }

    await db.executionStep.update({
      where: { executionId_nodeId: { executionId, nodeId } },
      data: { status: 'COMPLETED', output: result.data, completedAt: new Date() }
    });

    await publishEvent('execution-events', executionId, {
      tenantId: context.tenantId,
      executionId,
      nodeId,
      status: 'COMPLETED',
      output: result.data
    });

    const newContext = { ...context, [nodeId]: result.data };

    const outgoingEdges = dag.edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      await this.executeNodeRecursive(executionId, edge.target, dag, newContext);
    }
  }
}