import { db } from '@eventflux/database';

export class PublishWorkflowUseCase {
  async execute(tenantId: string, workflowId: string, versionId: string) {
    return await db.$transaction(async (tx) => {
      const workflow = await tx.workflow.findFirst({
        where: { id: workflowId, tenantId }
      });
      if (!workflow) throw new Error("Workflow not found or unauthorized");

      await tx.workflowVersion.updateMany({
        where: { workflowId, status: 'PUBLISHED' },
        data: { status: 'ARCHIVED' }
      });


      const published = await tx.workflowVersion.update({
        where: { id: versionId },
        data: { status: 'PUBLISHED' }
      });

      return published;
    });
  }
}