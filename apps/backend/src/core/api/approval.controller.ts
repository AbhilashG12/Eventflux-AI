import { Request, Response } from 'express';
import { db } from '@eventflux/database';
// 🚀 THE FIX: Import the engine directly
import { ExecuteWorkflowUseCase } from '../../modules/workflow/application/execute.workflow.js'; 

// Initialize the engine
const engine = new ExecuteWorkflowUseCase();

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
      // 🚀 THE FIX: Instantly resume the engine directly! No Kafka routing bugs!
      // We don't await this so the UI gets an instant 200 OK response while the engine crunches in the background
      engine.resume(approval.executionId, { action: 'APPROVED' }).catch(console.error);
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