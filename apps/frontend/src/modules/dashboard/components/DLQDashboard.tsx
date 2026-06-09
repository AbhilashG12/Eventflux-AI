import { useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, RefreshCw, ChevronRight, AlertCircle, History, RotateCcw } from 'lucide-react';
import { useDLQ } from '../hooks/useDLQ';

const scrollbarStyles = "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full";
const springTransition = { type: "spring", stiffness: 300, damping: 20 } as const;

// 🚀 Simplified native component, no react-window style props needed
const DLQRow = memo(({ item, expandedRow, isReplaying, toggleRow, handleReplay }: any) => {
  const isExpanded = expandedRow === item.id;
  
  const onToggle = useCallback(() => toggleRow(item.id), [toggleRow, item.id]);
  const onReplay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleReplay(item.id);
  }, [handleReplay, item.id]);

  return (
    <div className="mb-2 pr-2">
      <div className={`flex flex-col border border-white/5 rounded-lg bg-black/20 hover:bg-white/5 transition-colors group overflow-hidden ${isExpanded ? 'bg-white/5' : ''}`}>
        
        <div className="grid grid-cols-12 items-center px-6 h-16 cursor-pointer" onClick={onToggle}>
          <div className="col-span-3 font-mono text-gray-300 flex items-center gap-3">
            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={springTransition}>
              <ChevronRight className={`w-4 h-4 ${isExpanded ? 'text-indigo-400' : 'text-gray-600 group-hover:text-indigo-400'} transition-colors`} />
            </motion.div>
            <span className="truncate">{item.id.slice(0, 8)}...</span>
          </div>
          
          <div className="col-span-3 font-mono text-indigo-300/80 truncate pr-4">
            {item.payload?.workflowId || 'N/A'}
          </div>
          
          <div className="col-span-4 text-red-400/80 font-mono text-[11px] truncate pr-4" title={item.error}>
            {item.error}
          </div>
          
          <div className="col-span-1">
            <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md font-bold text-[10px] text-gray-300">
              {item.retryCount}
            </span>
          </div>
          
          <div className="col-span-1 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={onReplay}
              disabled={isReplaying === item.id}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            >
              {isReplaying === item.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
              {isReplaying === item.id ? 'Queuing' : 'Replay'}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="px-8 pb-6 pt-2 border-t border-white/5 ml-6 overflow-hidden"
            >
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <History className="w-3.5 h-3.5" /> Replay Audit Log
              </h4>
              {item.history?.length > 0 ? (
                <div className="space-y-2">
                  {item.history.map((hist: any) => (
                    <div key={hist.id} className="flex items-center gap-6 text-[11px] bg-black/40 p-3 rounded-lg border border-white/5 font-mono">
                      <span className="text-gray-500">{new Date(hist.replayedAt).toLocaleString()}</span>
                      <span className="text-gray-300">User: {hist.userId.slice(0, 8)}</span>
                      <span className={`font-bold tracking-widest ${hist.status === 'SUCCESS' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {hist.status}
                      </span>
                      <span className="text-gray-400">{hist.message}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-600 italic font-mono">No replay history found for this event.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
});

DLQRow.displayName = 'DLQRow';

export const DLQDashboard = () => {
  const { dlqItems, expandedRow, isReplaying, handleReplay, toggleRow } = useDLQ();

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className={`max-w-7xl mx-auto p-6 h-full flex flex-col ${scrollbarStyles}`}
    >
      <div className="mb-8 shrink-0">
        <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          Dead Letter Queue
        </h2>
        <p className="text-sm text-gray-500 mt-2 font-mono tracking-wide">Review, debug, and safely replay failed background events.</p>
      </div>

      <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
        
        <div className="grid grid-cols-12 items-center px-6 py-4 bg-white/5 border-b border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
          <div className="col-span-3">Event ID</div>
          <div className="col-span-3">Workflow ID</div>
          <div className="col-span-4">Reason</div>
          <div className="col-span-1">Retries</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* 🚀 Native scrolling container replacing AutoSizer */}
        <div className={`flex-1 overflow-y-auto p-4 ${scrollbarStyles}`}>
          {dlqItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 font-mono text-xs uppercase tracking-widest gap-3">
              <AlertCircle className="w-8 h-8 opacity-20" />
              Queue is healthy & empty
            </div>
          ) : (
            dlqItems.map((item: any) => (
              <DLQRow
                key={item.id}
                item={item}
                expandedRow={expandedRow}
                isReplaying={isReplaying}
                toggleRow={toggleRow}
                handleReplay={handleReplay}
              />
            ))
          )}
        </div>

      </div>
    </motion.div>
  );
};