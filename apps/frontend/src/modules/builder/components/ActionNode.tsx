import { Handle, Position } from 'reactflow';

export const ActionNode = ({ data }: any) => {
  const isAI = data.actionType === 'ai_generate';
  const isHTTP = data.actionType === 'http_request';
  const dotColor = isAI ? 'bg-purple-500' : isHTTP ? 'bg-blue-500' : 'bg-gray-500';

  return (
    <div className="min-w-55 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden text-gray-100 transition-all hover:border-gray-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
 
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-surface border-2 border-indigo-500 rounded-full"
      />

      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-[#1a1a1a]">
        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${dotColor}`} />
        <span className="text-sm font-semibold tracking-wide">
          {data.label || 'Action Node'}
        </span>
      </div>

      <div className="px-4 py-3 bg-[#0f0f0f]">
        <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">
          {data.actionType || 'Unconfigured'}
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-surface border-2 border-emerald-500 rounded-full"
      />
    </div>
  );
};