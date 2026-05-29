import { Handle, Position } from 'reactflow';
import { MessageSquare } from 'lucide-react';

export const SlackNode = ({ data, selected }: any) => {
  return (
    <div className={`w-70 bg-[#0a0a0a]/90 backdrop-blur-xl border-2 rounded-2xl shadow-2xl transition-all ${
      selected ? 'border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]' : 'border-white/10'
    }`}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-pink-500 border-2 border-[#0a0a0a] rounded-full" 
      />

      <div className="p-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
          <MessageSquare className="text-pink-400 w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="text-sm font-bold text-gray-200 tracking-wide truncate">
            {data.label || 'Send Slack Message'}
          </h3>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {data.config?.webhookUrl ? 'Configured' : 'Needs configuration'}
          </p>
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-gray-500 border-2 border-[#0a0a0a] rounded-full" 
      />
    </div>
  );
};