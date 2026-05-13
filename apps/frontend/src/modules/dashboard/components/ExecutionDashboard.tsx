import { useEffect, useRef } from 'react';
import { socketClient } from '../../../core/websocket/socket.client';
import { useExecutionStore } from '../../../core/store/execution.store';

export const ExecutionDashboard = ({ workflowNodes }: { workflowNodes: any[] }) => {
  const { nodeStatuses, logs, updateNodeStatus } = useExecutionStore();
  
  // 🔥 The Deduplication Shield: Tracks events that have already been painted to the UI
  const processedEvents = useRef<Set<string>>(new Set());

  useEffect(() => {
    socketClient.connect();

    const handleNodeUpdate = (payload: any) => {
      // 1. Create a unique fingerprint for this execution step
      const eventFingerprint = `${payload.nodeId}-${payload.status}`;

      // 2. If we've already seen this exact status for this exact node, drop the event completely.
      if (processedEvents.current.has(eventFingerprint)) return;
      
      // 3. Otherwise, log it in the shield and process it
      processedEvents.current.add(eventFingerprint);

      const logMessage = payload.status === 'FAILED' 
        ? `Error: ${payload.error}` 
        : `Completed successfully.`;
        
      updateNodeStatus(payload.nodeId, payload.status, logMessage);
    };

    socketClient.subscribe('node_status_update', handleNodeUpdate);

    return () => {

      socketClient.unsubscribe('node_status_update');
    };
  }, [updateNodeStatus]);

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.2)]';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'FAILED': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-[#0a0a0a] text-gray-500 border-white/10'; 
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Live Execution Run</h2>
          <p className="text-sm text-gray-400 mt-1">Real-time WebSocket telemetry</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          <span className="text-xs text-emerald-500 font-bold tracking-widest">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Node Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workflowNodes.map((node, idx) => {
          const status = nodeStatuses[node.id] || 'PENDING';
          return (
            <div key={node.id} className="relative flex items-center">
              {idx !== 0 && (
                <div className="hidden md:block absolute -left-4 w-4 h-0.5 bg-white/10"></div>
              )}
              
              <div className={`w-full flex flex-col justify-center items-center py-4 px-6 rounded-xl border backdrop-blur-md transition-all duration-300 ${getBadgeStyle(status)}`}>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">{status}</span>
                <span className="text-sm font-medium">{node.data?.label || node.type}</span>
                <span className="text-[10px] mt-2 opacity-40 font-mono tracking-tighter">{node.id}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-xl overflow-hidden border border-white/10 bg-[#050505] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="bg-black/40 px-4 py-2 border-b border-white/5 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          <span className="text-xs text-gray-600 font-mono ml-2">eventflux-worker-01</span>
        </div>
        
        <div className="p-4 font-mono text-sm space-y-2 min-h-50 max-h-100 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-600 flex items-center gap-2">
              <span className="animate-pulse">_</span> Waiting for execution to start...
            </div>
          ) : null}
          
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 hover:bg-white/5 px-2 py-1 rounded transition-colors">
              <span className="text-gray-600 shrink-0">
                [{new Date(log.timestamp || Date.now()).toLocaleTimeString()}]
              </span>
              <span className="text-indigo-400/80 shrink-0">{log.nodeId} <span className="text-gray-600">→</span></span>
              <span className={log.message.includes('Error') ? 'text-red-400' : 'text-gray-300'}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};