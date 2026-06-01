import { useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Activity, Server } from 'lucide-react';

// @ts-expect-error - PNPM workspace type resolution bypass
import { FixedSizeList as List, areEqual } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';

import { type ExecutionLog } from '../hooks/useExecutionTelemetry';
import { getStatusIcon } from './ExecutionSidebar';

interface ExecutionTerminalProps {
  logs: ExecutionLog[];
  executionId: string | null;
  status?: string;
}

const LogRow = memo(({ index, style, data }: any) => {
  const { logs } = data; 

  if (index === logs.length) {
    return (
      <div style={style} className="flex gap-4 px-6 items-center animate-pulse bg-white/1">
        <span className="text-gray-600 shrink-0 w-28 text-[11px] font-mono">--:--:--.---</span>
        <span className="text-amber-500/80 shrink-0 w-20 text-[10px] font-bold tracking-widest">[WAIT]</span>
        <span className="text-gray-500 text-[11px] italic">Awaiting next step execution...</span>
      </div>
    );
  }

  const log = logs[index];
  
  return (
    <div 
      style={style} 
      className="flex gap-4 px-6 items-center hover:bg-white/3 border-b border-white/2 transition-colors group"
    >
      <span className="text-gray-500 shrink-0 w-28 text-[10px] font-mono group-hover:text-gray-400 transition-colors">
        {new Date(log.timestamp).toISOString().substring(11, 23)}
      </span>
      
      {log.status === 'RUNNING' && <span className="text-blue-400 shrink-0 w-20 text-[10px] font-bold tracking-widest">[START]</span>}
      {log.status === 'COMPLETED' && <span className="text-emerald-400 shrink-0 w-20 text-[10px] font-bold tracking-widest">[DONE]</span>}
      {log.status === 'FAILED' && <span className="text-red-400 shrink-0 w-20 text-[10px] font-bold tracking-widest">[ERROR]</span>}
      
      <span className={`text-[11px] truncate font-mono ${log.status === 'FAILED' ? 'text-red-300' : 'text-gray-300'}`}>
        {log.message}
      </span>
    </div>
  );
}, areEqual);

LogRow.displayName = 'LogRow';

export const ExecutionTerminal = ({ logs, executionId, status }: ExecutionTerminalProps) => {
  const listRef = useRef<any>(null);

  useEffect(() => {
    if (listRef.current && logs.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToItem(logs.length + (status === 'RUNNING' ? 1 : 0), 'end');
      }, 50);
    }
  }, [logs.length, status]);

  const scrollbarStyles = "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full";

  return (
    <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative group">
      <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* HEADER */}
      <div className="bg-white/2 border-b border-white/5 px-5 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Terminal className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-gray-200 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
            Execution Logs 
            {executionId && (
              <span className="text-gray-500 font-mono text-[10px] bg-black/40 px-2 py-0.5 rounded border border-white/5">
                {executionId.split('_')[1]}
              </span>
            )}
          </span>
        </div>
        
        <AnimatePresence mode="wait">
          {executionId && status && (
            <motion.span 
              key={status}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 border ${
                status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
              }`}
            >
              {status === 'RUNNING' && <Activity className="w-3 h-3 animate-pulse" />}
              {getStatusIcon(status)}
              {status}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* VIRTUALIZED LOGS BODY */}
      <div className="flex-1 bg-black/60 shadow-inner relative z-10 overflow-hidden">
        {!executionId ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-gray-600 gap-3"
          >
            <Server className="w-8 h-8 opacity-20" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Select a run to view traces</span>
          </motion.div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-white/2 flex gap-4 items-center bg-black/40">
              <span className="text-gray-600 shrink-0 w-28 text-[10px] font-mono">--:--:--.---</span>
              <span className="text-purple-400 shrink-0 w-20 text-[10px] font-bold tracking-widest">[BOOT]</span>
              <span className="text-gray-500 text-[11px] font-mono">Initialize isolated execution environment... OK</span>
            </div>

            <div className="h-[calc(100%-41px)] w-full">
              {/* @ts-expect-error - AutoSizer typing bypass */}
              <AutoSizer>
                {({ height, width }: any) => (
                  <List
                    ref={listRef}
                    height={height}
                    width={width}
                    itemCount={logs.length + (status === 'RUNNING' ? 1 : 0)}
                    itemSize={36} 
                    itemData={{ logs, status }} 
                    className={scrollbarStyles}
                    overscanCount={5} 
                  >
                    {LogRow}
                  </List>
                )}
              </AutoSizer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};