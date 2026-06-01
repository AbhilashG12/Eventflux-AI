import { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';


export interface ActionNodeData {
  actionType?: string;
  label?: string;
  status?: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
}

export const ActionNode = memo(({ data, selected }: NodeProps<ActionNodeData>) => {
  const { actionType = 'unconfigured', label = 'Action Node', status = 'IDLE' } = data || {};
  const visuals = useMemo(() => {
    let dot = 'bg-gray-500'; 
    let ring = 'shadow-[0_0_8px_currentColor]';
    let border = 'border-white/5 hover:border-white/20';
    let badgeBg = '';
    let badgeText = '';

    if (status === 'RUNNING') {
      dot = 'bg-yellow-400';
      ring = 'shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse';
      border = 'border-yellow-500/50 shadow-[0_0_20px_rgba(250,204,21,0.1)]';
      badgeBg = 'bg-yellow-400/10';
      badgeText = 'text-yellow-400';
    } else if (status === 'COMPLETED') {
      dot = 'bg-emerald-500';
      ring = 'shadow-[0_0_12px_rgba(16,185,129,0.5)]';
      border = 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]';
      badgeBg = 'bg-emerald-500/10';
      badgeText = 'text-emerald-400';
    } else if (status === 'FAILED') {
      dot = 'bg-red-500';
      ring = 'shadow-[0_0_15px_rgba(239,68,68,0.8)]';
      border = 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]';
      badgeBg = 'bg-red-500/10';
      badgeText = 'text-red-400';
    } else {
      const isAI = actionType === 'ai_generate';
      const isHTTP = actionType === 'http_request';
      dot = isAI ? 'bg-purple-500' : isHTTP ? 'bg-blue-500' : 'bg-gray-500';
    }

    return { dot, ring, border, badgeBg, badgeText };
  }, [status, actionType]); 

  return (
    <div 
      className={`min-w-55 bg-black/80 backdrop-blur-xl border rounded-xl overflow-hidden text-gray-100 transition-all duration-300 ${visuals.border} ${
        selected ? 'ring-2 ring-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'shadow-2xl'
      }`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-black border-2 border-indigo-500 rounded-full hover:bg-indigo-500 transition-colors cursor-crosshair" 
      />

      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/5">
        <div className={`w-2 h-2 rounded-full ${visuals.ring} ${visuals.dot} transition-colors duration-300 shrink-0`} />
        <span className="text-xs font-bold tracking-widest uppercase truncate">{label}</span>
      </div>

      <div className="px-4 py-3 bg-transparent flex justify-between items-center gap-4">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono truncate">
          {actionType.replace('_', ' ')}
        </div>
        
        {status !== 'IDLE' && (
          <div className={`text-[9px] font-mono font-bold px-2 py-1 rounded-md tracking-widest border border-current/20 ${visuals.badgeText} ${visuals.badgeBg}`}>
            {status}
          </div>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-black border-2 border-emerald-500 rounded-full hover:bg-emerald-500 transition-colors cursor-crosshair" 
      />
    </div>
  );
});

// Required for React DevTools to display the component name correctly when using memo
ActionNode.displayName = 'ActionNode';