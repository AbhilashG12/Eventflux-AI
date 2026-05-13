import { db } from '@eventflux/database';

export class SaveDraftUseCase {
  async execute(tenantId: string, payload: any) {
    const { name, description, definition } = payload;

    const workflow = await db.workflow.create({
      data: {
        name: name || "My Canvas Workflow",
        description: description || "",
        definition: definition || { nodes: [], edges: [] },
        tenantId: tenantId,
      }
    });

    return workflow;
  }
}