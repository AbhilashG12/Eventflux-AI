import { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { type ExecutionLog } from '../hooks/useExecutionTelemetry';
import { getStatusIcon } from './ExecutionSidebar';

interface ExecutionTerminalProps {
  logs: ExecutionLog[];
  executionId: string | null;
  status?: string;
}

export const ExecutionTerminal = ({ logs, executionId, status }: ExecutionTerminalProps) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex-1 bg-[#0d1117] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden font-mono text-sm">
      <div className="bg-[#161b22] border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-gray-400" />
          <span className="text-gray-200 font-semibold">
            Execution Logs {executionId ? `(${executionId.split('_')[1]})` : ''}
          </span>
        </div>
        {executionId && status && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-gray-300 border border-white/10 flex items-center gap-2">
            {getStatusIcon(status)}
            {status}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-2 text-gray-300">
        {!executionId ? (
          <div className="h-full flex items-center justify-center text-gray-600">Select a run to view logs</div>
        ) : (
          <>
            <div className="text-gray-500 mb-4">Initialize execution environment... OK</div>
            {logs.map((log, i) => (
              <div key={log.id || i} className="flex gap-4 hover:bg-white/5 p-1 -mx-1 rounded px-2 transition-colors">
                <span className="text-gray-600 shrink-0 w-24">
                  {new Date(log.timestamp).toISOString().substring(11, 23)}
                </span>
                {log.status === 'RUNNING' && <span className="text-blue-400 shrink-0 w-20">[START]</span>}
                {log.status === 'COMPLETED' && <span className="text-emerald-400 shrink-0 w-20">[DONE]</span>}
                {log.status === 'FAILED' && <span className="text-red-400 shrink-0 w-20">[ERROR]</span>}
                <span className={log.status === 'FAILED' ? 'text-red-300' : 'text-gray-300'}>
                  {log.message}
                </span>
              </div>
            ))}
            
            {status === 'RUNNING' && (
              <div className="flex gap-4 mt-4 animate-pulse">
                <span className="text-gray-600 shrink-0 w-24">--:--:--.---</span>
                <span className="text-yellow-400 shrink-0 w-20">[WAIT]</span>
                <span className="text-gray-500">Awaiting next step execution...</span>
              </div>
            )}
            <div ref={logsEndRef} />
          </>
        )}
      </div>
    </div>
  );
};