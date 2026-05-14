import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { type Execution } from '../hooks/useExecutionTelemetry';

interface ExecutionSidebarProps {
  executions: Execution[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const getStatusIcon = (status: string) => {
  if (status === 'COMPLETED') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  if (status === 'FAILED') return <XCircle className="w-4 h-4 text-red-500" />;
  return <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />;
};

export const ExecutionSidebar = ({ executions, selectedId, onSelect }: ExecutionSidebarProps) => {
  return (
    <div className="w-80 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-xl flex flex-col overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" /> Run History
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {executions.map(exec => (
          <button
            key={exec.id}
            onClick={() => onSelect(exec.id)}
            className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${
              selectedId === exec.id ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {getStatusIcon(exec.status)}
              <div className="truncate">
                <p className="text-sm font-medium text-gray-200 truncate">{exec.id.split('_')[1] || exec.id}</p>
                <p className="text-xs text-gray-500">{new Date(exec.startedAt).toLocaleTimeString()}</p>
              </div>
            </div>
          </button>
        ))}
        {executions.length === 0 && (
          <p className="text-xs text-center text-gray-500 mt-4">No executions found.</p>
        )}
      </div>
    </div>
  );
};