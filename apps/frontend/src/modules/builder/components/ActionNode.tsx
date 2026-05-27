import { Handle, Position } from 'reactflow';

export const ActionNode = ({ data }: any) => {

  const { actionType = 'unconfigured', label = 'Action Node', status = 'IDLE' } = data || {};

  let dotColor = 'bg-gray-500'; 
  let ringColor = 'shadow-[0_0_8px_currentColor]';

  if (status === 'RUNNING') {
    dotColor = 'bg-yellow-400';
    ringColor = 'shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse';
  } else if (status === 'COMPLETED') {
    dotColor = 'bg-green-500';
    ringColor = 'shadow-[0_0_12px_rgba(34,197,94,0.5)]';
  } else if (status === 'FAILED') {
    dotColor = 'bg-red-500';
    ringColor = 'shadow-[0_0_15px_rgba(239,68,68,0.8)]';
  } else {
    const isAI = actionType === 'ai_generate';
    const isHTTP = actionType === 'http_request';
    dotColor = isAI ? 'bg-purple-500' : isHTTP ? 'bg-blue-500' : 'bg-gray-500';
  }

  return (
    <div className={`min-w-55 bg-surface border rounded-xl shadow-2xl overflow-hidden text-gray-100 transition-all duration-300 ${
      status === 'RUNNING' ? 'border-yellow-500/50' : 
      status === 'COMPLETED' ? 'border-green-500/30' : 
      status === 'FAILED' ? 'border-red-500/50' : 'border-border hover:border-gray-500'
    }`}>
 
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-surface border-2 border-indigo-500 rounded-full" />

      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#1a1a1a]">
        <div className={`w-2 h-2 rounded-full ${ringColor} ${dotColor} transition-colors duration-300`} />
        <span className="text-sm font-semibold tracking-wide">{label}</span>
      </div>

      <div className="px-4 py-3 bg-[#0f0f0f] flex justify-between items-center">
        <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">
          {actionType}
        </div>
        {status !== 'IDLE' && (
          <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
            status === 'RUNNING' ? 'text-yellow-400 bg-yellow-400/10' : 
            status === 'COMPLETED' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
          }`}>
            {status}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-surface border-2 border-emerald-500 rounded-full" />
    </div>
  );
};