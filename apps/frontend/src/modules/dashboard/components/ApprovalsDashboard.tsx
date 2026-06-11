import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { apiClient } from '../../../core/api/client'; // Assuming you have an Axios instance
import { useSuccessStore } from '../../../core/store/success.store';
import { useErrorStore } from '../../../core/store/error.store';

export const ApprovalsDashboard = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const showSuccess = useSuccessStore((state) => state.showSuccess);
  const showError = useErrorStore((state) => state.showError);

  const fetchApprovals = async () => {
    try {
      // You will need to create this GET endpoint in your backend
      // It should query: prisma.approvalRequest.findMany({ where: { status: 'PENDING' } })
      const { data } = await apiClient.get('/approvals/pending');
      setApprovals(data);
    } catch (error) {
      console.error("Failed to fetch approvals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleResolve = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      // Optimistic UI update: remove it from the list instantly
      setApprovals(prev => prev.filter(a => a.id !== id));
      
      await apiClient.post(`/approvals/${id}/resolve`, { action });
      showSuccess(`Workflow execution ${action.toLowerCase()}d successfully.`);
    } catch (error: any) {
      showError(`Resolution failed: ${error.message}`);
      fetchApprovals(); // Revert optimistic update on failure
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500 font-mono">Loading pending requests...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <UserCheck className="w-5 h-5 text-amber-400" />
          </div>
          Action Required
        </h2>
        <p className="text-sm text-gray-500 mt-2 font-mono">Workflows paused awaiting your authorization.</p>
      </div>

      <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 overflow-y-auto">
        {approvals.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 font-mono text-xs gap-3">
            <CheckCircle2 className="w-8 h-8 opacity-20" />
            Inbox Zero. No pending approvals.
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {approvals.map((approval) => (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-200">{approval.workflow?.name || 'Untitled Workflow'}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> PENDING
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono flex gap-4 mt-1">
                      <span>Exec ID: {approval.executionId.slice(0, 13)}...</span>
                      <span>Requested: {new Date(approval.requestedAt).toLocaleTimeString()}</span>
                    </div>
                    {/* Optional: Show contextual data here so they know WHAT they are approving */}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleResolve(approval.id, 'REJECT')}
                      className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button 
                      onClick={() => handleResolve(approval.id, 'APPROVE')}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};