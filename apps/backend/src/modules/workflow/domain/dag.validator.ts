import { z } from 'zod';


export const DagSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    type: z.enum(['TRIGGER', 'ACTION', 'CONDITION']),
    data: z.record(z.string(), z.any()) 
  })).min(1, "Workflow must have at least one node"),
  edges: z.array(z.object({
    source: z.string(),
    target: z.string()
  }))
});


export type DagDefinition = z.infer<typeof DagSchema>;

export class DagValidator {
  static validate(definition: unknown): DagDefinition {
    const parsed = DagSchema.parse(definition);

    if (this.hasCycle(parsed)) {
      throw new Error("Invalid DAG: Cycle detected. Workflows cannot have infinite loops.");
    }

    return parsed;
  }

  private static hasCycle(dag: DagDefinition): boolean {
    const adjList = new Map<string, string[]>();
    dag.nodes.forEach(n => adjList.set(n.id, []));
    dag.edges.forEach(e => {
      if (!adjList.has(e.source) || !adjList.has(e.target)) {
        throw new Error(`Edge references missing node: ${e.source} -> ${e.target}`);
      }
      adjList.get(e.source)!.push(e.target);
    });

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (recStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adjList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) return true;
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of dag.nodes) {
      if (dfs(node.id)) return true;
    }

    return false;
  }
}