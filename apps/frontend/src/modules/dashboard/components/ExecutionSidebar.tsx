import { memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Loader2, Activity } from 'lucide-react';
import { type Execution } from '../hooks/useExecutionTelemetry';

// @ts-expect-error - PNPM workspace type resolution bypass
import { FixedSizeList as List, areEqual } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';

interface ExecutionSidebarProps {
  executions: Execution[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const getStatusIcon = (status: string) => {
  if (status === 'COMPLETED') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === 'FAILED') return <XCircle className="w-4 h-4 text-red-400" />;
  return <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />;
};

const SidebarRow = memo(({ index, style, data }: any) => {
  const { executions, selectedId, onSelect } = data;
  const exec = executions[index];
  const isSelected = selectedId === exec.id;

  return (
    <div style={style} className="px-3 py-1.5">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(exec.id)}
        className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all relative overflow-hidden group border ${
          isSelected 
            ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
            : 'bg-transparent hover:bg-white/3 border-transparent hover:border-white/5'
        }`}
      >
        {/* Animated Active Indicator */}
        {isSelected && (
          <motion.div 
            layoutId="activeSidebarRow" 
            className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" 
          />
        )}
        
        <div className="flex items-center gap-3 overflow-hidden z-10 relative">
          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-500/10' : 'bg-white/5 group-hover:bg-white/10 transition-colors'}`}>
            {getStatusIcon(exec.status)}
          </div>
          <div className="truncate">
            <p className={`text-xs font-bold font-mono truncate transition-colors ${isSelected ? 'text-indigo-300' : 'text-gray-300'}`}>
              {exec.id.split('_')[1] || exec.id}
            </p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5 tracking-wider">
              {new Date(exec.startedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </motion.button>
    </div>
  );
}, areEqual);

SidebarRow.displayName = 'SidebarRow';

export const ExecutionSidebar = ({ executions, selectedId, onSelect }: ExecutionSidebarProps) => {
  const listRef = useRef<any>(null);

  const scrollbarStyles = "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full";

  return (
    <div className="w-80 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative group shrink-0">
      
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* HEADER */}
      <div className="p-4 border-b border-white/5 bg-white/2 relative z-10 flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" /> Run History
        </h3>
        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-[9px] font-bold text-gray-500 font-mono tracking-widest">
          {executions.length} RUNS
        </span>
      </div>
      
      {/* VIRTUALIZED LIST BODY */}
      <div className={`flex-1 w-full relative z-10 bg-black/20 shadow-inner ${scrollbarStyles}`}>
        <AnimatePresence mode="wait">
          {executions.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 gap-3"
            >
              <Activity className="w-8 h-8 opacity-20" />
              <p className="text-[10px] uppercase tracking-widest font-bold">No runs recorded</p>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0"
            >
              {/* @ts-expect-error - AutoSizer typing bypass */}
              <AutoSizer>
                {({ height, width }: any) => (
                  <List
                    ref={listRef}
                    height={height}
                    width={width}
                    itemCount={executions.length}
                    itemSize={76} // 64px button + 12px padding
                    itemData={{ executions, selectedId, onSelect }}
                    className={scrollbarStyles}
                    overscanCount={5}
                  >
                    {SidebarRow}
                  </List>
                )}
              </AutoSizer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};