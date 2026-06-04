import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle, XCircle, ChevronRight, Terminal, Activity, Code2 } from 'lucide-react';
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
  executionId?: string | null;
}

export const ExecutionLogsDrawer = ({ isOpen, onClose, executionId }: Props) => {
  const token = useAuthStore((state: any) => state.token);
  const workflowId = useWorkflowStore((state) => state.workflowId);
  
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [selectedExec, setSelectedExec] = useState<string | null>(null);
  const [detailedLogs, setDetailedLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      if (workflowId) {
        fetchExecutions();
      }
      if (executionId) {
        setSelectedExec(executionId);
        fetchLogs(executionId);
      }
    }
  }, [isOpen, workflowId, executionId, token]);

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

  const fetchLogs = async (execId: string) => {
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

  const handleSelectExecution = (execId: string) => {
    if (selectedExec === execId) {
      setSelectedExec(null);
      setDetailedLogs([]);
      return;
    }
    
    setSelectedExec(execId);
    fetchLogs(execId);
  };

  const scrollbarStyles = "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: "100%", opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0.5 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="absolute bottom-0 left-0 right-0 h-[45%] bg-[#050505]/80 backdrop-blur-3xl border-t border-white/10 z-100 flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/2">
            <div className="flex items-center gap-2 text-gray-200 font-bold uppercase tracking-widest text-xs">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                <Terminal size={14} className="text-indigo-400" />
              </div>
              Execution History
            </div>
            
            <div className="flex gap-4 items-center">
              {executions.some(e => ['RUNNING', 'PENDING'].includes(e.status)) && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
                  className="cursor-pointer text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                >
                  <XCircle size={12} /> Force Stop
                </motion.button>
              )}
              
              <button 
                onClick={fetchExecutions} 
                className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors"
              >
                Refresh
              </button>
              
              <div className="w-px h-4 bg-white/10 mx-2" />
              
              <button 
                onClick={onClose} 
                className="cursor-pointer text-gray-500 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            
            <div className={`w-1/3 border-r border-white/5 overflow-y-auto ${scrollbarStyles}`}>
              {loading && (
                <div className="p-8 flex flex-col items-center justify-center text-gray-500 gap-3">
                  <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest">Loading runs...</span>
                </div>
              )}
              
              {!loading && executions.length === 0 && !executionId && (
                <div className="p-8 flex flex-col items-center justify-center text-gray-500 gap-3 text-center">
                  <Terminal size={24} className="opacity-20" />
                  <span className="text-[10px] uppercase tracking-widest leading-relaxed">No executions found.<br/>Trigger the webhook!</span>
                </div>
              )}
              
              {!loading && executions.map((exec) => {
                const isSelected = selectedExec === exec.id;
                
                return (
                  <div 
                    key={exec.id} 
                    onClick={() => handleSelectExecution(exec.id)}
                    className={`p-4 border-b border-white/5 cursor-pointer transition-all relative overflow-hidden ${
                      isSelected ? 'bg-indigo-500/5' : 'hover:bg-white/2'
                    }`}
                  >
                    {isSelected && (
                      <motion.div layoutId="activeLog" className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                    )}
                    
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[11px] font-mono transition-colors ${isSelected ? 'text-indigo-300' : 'text-gray-400'}`}>
                        {exec.id.substring(0, 16)}...
                      </span>
                      {exec.status === 'COMPLETED' ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md"><CheckCircle size={10}/> Success</span>
                      ) : ['RUNNING', 'PENDING'].includes(exec.status) ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md animate-pulse">Running</span>
                      ) : exec.status === 'CANCELLED' ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase text-gray-400 bg-gray-500/10 border border-gray-500/20 px-2 py-0.5 rounded-md"><XCircle size={10}/> Cancelled</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md"><XCircle size={10}/> Failed</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Clock size={10} />
                      {new Date(exec.startedAt).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`flex-1 bg-black/40 p-6 overflow-y-auto relative ${scrollbarStyles}`}>
              {!selectedExec ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-3">
                  <Code2 size={24} className="opacity-20" />
                  <span className="text-[10px] uppercase tracking-widest">Select an execution to view traces</span>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  className="space-y-6 max-w-4xl"
                >
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-3 flex items-center gap-2">
                    <Activity size={12} className="text-indigo-400" /> Pipeline Trace
                  </h3>
                  
                  {detailedLogs.length === 0 && !loading && (
                    <div className="text-[11px] text-gray-500 font-mono">No trace data available for this execution.</div>
                  )}

                  {detailedLogs.map((log, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={log.id} 
                      className="bg-white/2 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-300 font-mono flex items-center gap-2">
                          <ChevronRight size={14} className="text-indigo-400" />
                          Node: {log.nodeId}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-widest border ${
                          log.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                          log.status === 'CANCELLED' ? 'text-gray-400 bg-gray-500/10 border-gray-500/20' : 
                          log.status === 'RETRYING' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
                          'text-red-400 bg-red-500/10 border-red-500/20'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      
                      {log.output && (
                        <div className="mt-3">
                          <div className="text-[9px] text-gray-500 mb-1.5 uppercase tracking-widest font-bold">JSON Output</div>
                          <div className="relative group">
                            <div className="absolute top-0 left-0 right-0 h-6 bg-black/60 rounded-t-lg border-b border-white/5 flex items-center px-3 gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-red-500/50" />
                              <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                              <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                            </div>
                            <pre className="bg-black/40 pt-8 pb-3 px-4 rounded-lg text-[11px] text-emerald-300/90 font-mono overflow-x-auto border border-white/5 leading-relaxed shadow-inner whitespace-pre-wrap">
                              {JSON.stringify(log.output, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};