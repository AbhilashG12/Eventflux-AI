import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { UserCheck, Clock } from 'lucide-react';

const ApprovalNodeComponent = ({ data, isConnectable, selected }: NodeProps) => {
  // If the telemetry socket updates this node to 'PAUSED', we can show a waiting indicator
  const isWaiting = data?.status === 'PAUSED';

  return (
    <div className={`relative px-4 py-3 rounded-xl border-2 transition-all bg-[#0a0a0a] ${
      selected ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-white/10'
    }`}>
      
      {/* Input Handle */}
      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable} 
        className="w-3 h-3 bg-amber-500 border-2 border-gray-900"
      />

      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg transition-colors ${isWaiting ? 'bg-amber-500/20 animate-pulse' : 'bg-white/5'}`}>
          {isWaiting ? (
            <Clock className="w-4 h-4 text-amber-400" />
          ) : (
            <UserCheck className="w-4 h-4 text-amber-500" />
          )}
        </div>
        
        <div>
          <div className="text-sm font-bold text-gray-200">Human Approval</div>
          <div className="text-[10px] text-gray-500 truncate max-w-30 font-mono mt-0.5">
            {data?.config?.assigneeRole || 'Any Manager'}
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Right} 
        isConnectable={isConnectable}
        className="w-3 h-3 bg-amber-500 border-2 border-gray-900" 
      />
      
      {/* Live Waiting Indicator */}
      {isWaiting && (
        <div className="absolute -top-2 -right-2 flex items-center justify-center">
          <span className="absolute w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-75" />
          <span className="relative w-2 h-2 bg-amber-500 rounded-full" />
        </div>
      )}
    </div>
  );
};

// 🚀 Wrapped in memo for maximum canvas performance
export const ApprovalNode = memo(ApprovalNodeComponent);