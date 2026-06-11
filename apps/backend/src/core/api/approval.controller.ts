import { Request, Response } from 'express';
import { db } from '@eventflux/database';
import { publishEvent } from '@eventflux/kafka';

export const getPendingApprovals = async (req: Request, res: Response): Promise<void> => {
  try {
    // Note: Once auth is fully wired, you should filter by req.user.tenantId
    const pendingRequests = await (db as any).approvalRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { requestedAt: 'desc' },
      // Include workflow details so the dashboard can show the name
      // include: { workflow: { select: { name: true } } } 
    });

    res.status(200).json(pendingRequests);
  } catch (error: any) {
    console.error('Failed to fetch approvals:', error);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
};

export const resolveApproval = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { action } = req.body; // 'APPROVE' or 'REJECT'

  try {
    const approval = await (db as any).approvalRequest.update({
      where: { id },
      data: { 
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        resolvedAt: new Date(),
      }
    });

    if (action === 'APPROVE') {
      // 🚀 Inject the event BACK into Kafka to resume the DAG!
      await publishEvent('workflow-events', `resume-${approval.executionId}`, {
        type: 'RESUME_EXECUTION',
        executionId: approval.executionId,
        resumeFromNodeId: approval.nodeId
      });
    } else {
      // If rejected, mark the overall execution as FAILED
      await db.execution.update({
        where: { id: approval.executionId },
        data: { status: 'FAILED' }
      });
    }

    res.status(200).json({ success: true, status: approval.status });
  } catch (error: any) {
    console.error('Approval resolution failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};