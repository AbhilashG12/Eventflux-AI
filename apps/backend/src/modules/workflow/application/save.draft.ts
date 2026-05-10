import { db } from '@eventflux/database';
import { DagValidator } from '../domain/dag.validator.js';

export class SaveDraftUseCase {
  async execute(tenantId: string, input: { name: string, description?: string, definition: any }) {
    const validDag = DagValidator.validate(input.definition);
    return await db.$transaction(async (tx) => {
      const workflow = await tx.workflow.create({
        data: {
          name: input.name,
          description: input.description,
          tenantId
        }
      });


      const version = await tx.workflowVersion.create({
        data: {
          workflowId: workflow.id,
          version: 1,
          status: 'DRAFT',
          definition: validDag 
        }
      });

      return { workflowId: workflow.id, versionId: version.id, status: version.status };
    });
  }
}