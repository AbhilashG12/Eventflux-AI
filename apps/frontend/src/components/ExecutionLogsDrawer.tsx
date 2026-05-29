import { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, XCircle, ChevronRight, Terminal } from 'lucide-react';
import { useAuthStore } from '../core/store/auth.store';
import { useWorkflowStore } from '../core/store/workflow.store';

interface Execution {
  id: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  logs?: ExecutionLog[];
}

interface ExecutionLog {
  id: string;
  nodeId: string;
  status: string;
  message: string;
  output?: any;
  timestamp: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  executionId?: string|null;
}

export const ExecutionLogsDrawer = ({ isOpen, onClose }: Props) => {
  const token = useAuthStore((state) => state.token);
  const workflowId = useWorkflowStore((state) => state.workflowId);
  
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [selectedExec, setSelectedExec] = useState<string | null>(null);
  const [detailedLogs, setDetailedLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && workflowId && token) {
      fetchExecutions();
    }
  }, [isOpen, workflowId]);

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/executions/workflow/${workflowId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setExecutions(data || []);
    } catch (err) {
      console.error("Failed to fetch executions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExecution = async (execId: string) => {
    if (selectedExec === execId) {
      setSelectedExec(null);
      return;
    }
    
    setSelectedExec(execId);
    try {
      const res = await fetch(`http://localhost:3001/api/executions/${execId}/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDetailedLogs(data || []);
    } catch (err) {
      console.error("Failed to fetch detailed logs", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-[#0a0a0a] border-t border-white/10 z-50 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transform transition-transform duration-300">
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#141414]">
        <div className="flex items-center gap-2 text-white font-medium">
          <Terminal size={18} className="text-emerald-400" />
          Execution History
        </div>
        
        <div className="flex gap-4 items-center">
          {executions.some(e => ['RUNNING', 'PENDING'].includes(e.status)) && (
            <button 
              onClick={async () => {
                const runningExec = executions.find(e => ['RUNNING', 'PENDING'].includes(e.status));
                if (runningExec) {
                  await fetch(`http://localhost:3001/api/executions/${runningExec.id}/cancel`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  fetchExecutions(); 
                }
              }}
              className="text-xs px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors"
            >
              🛑 Force Stop Execution
            </button>
          )}
          
          <button onClick={fetchExecutions} className="text-xs cursor-pointer text-blue-400 hover:text-blue-300">Refresh</button>
          <button onClick={onClose} className="text-gray-400 cursor-pointer hover:text-white"><X size={18} /></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r border-white/5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
          {loading && <div className="p-4 text-gray-500 text-sm">Loading runs...</div>}
          {!loading && executions.length === 0 && (
            <div className="p-4 text-gray-500 text-sm">No executions found. Trigger the webhook!</div>
          )}
          
          {executions.map((exec) => (
            <div 
              key={exec.id} 
              onClick={() => handleSelectExecution(exec.id)}
              className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${selectedExec === exec.id ? 'bg-blue-900/20 border-l-2 border-l-blue-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-gray-400">{exec.id.substring(0, 16)}...</span>
                {exec.status === 'COMPLETED' ? (
                  <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded"><CheckCircle size={10}/> Success</span>
                ) : ['RUNNING', 'PENDING'].includes(exec.status) ? (
                  <span className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded animate-pulse">Running</span>
                ) : exec.status === 'CANCELLED' ? (
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-400/10 px-2 py-0.5 rounded"><XCircle size={10}/> Cancelled</span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded"><XCircle size={10}/> Failed</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <Clock size={12} />
                {new Date(exec.startedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-[#0f0f0f] p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 relative">
          {!selectedExec ? (
            <div className="h-full flex items-center justify-center text-gray-600 text-sm">
              Select an execution on the left to view detailed node logs.
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-white mb-4 border-b border-white/10 pb-2">Execution Pipeline</h3>
              {detailedLogs.map((log) => (
                <div key={log.id} className="bg-[#141414] border border-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-blue-300 font-mono flex items-center gap-2">
                      <ChevronRight size={14} />
                      Node: {log.nodeId}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${log.status === 'COMPLETED' ? 'text-green-400 bg-green-400/10' : log.status === 'CANCELLED' ? 'text-gray-400 bg-gray-400/10' : 'text-red-400 bg-red-400/10'}`}>
                      {log.status}
                    </span>
                  </div>
                  
                  {log.output && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Output</div>
                      <pre className="bg-black/40 p-3 rounded text-[11px] text-green-300 font-mono overflow-x-auto border border-white/5">
                        {JSON.stringify(log.output, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};