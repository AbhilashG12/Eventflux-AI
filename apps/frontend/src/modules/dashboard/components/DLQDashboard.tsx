import React from 'react'; // Added import
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ShieldAlert, RefreshCw, ChevronRight, AlertCircle, History, RotateCcw } from 'lucide-react'; // Removed unused Activity
import { useDLQ } from '../hooks/useDLQ';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

export const DLQDashboard = () => {
  const { dlqItems, expandedRow, isReplaying, handleReplay, toggleRow } = useDLQ();
  const scrollbarStyles = "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full";

  return (
    <motion.div 
      variants={containerVariants} initial="hidden" animate="show"
      className={`max-w-7xl mx-auto p-6 h-full ${scrollbarStyles}`}
    >
      <motion.div variants={rowVariants} className="mb-8">
        <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          Dead Letter Queue
        </h2>
        <p className="text-sm text-gray-500 mt-2 font-mono tracking-wide">Review, debug, and safely replay failed background events.</p>
      </motion.div>

      <motion.div 
        variants={rowVariants}
        className="bg-black/40 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/20 text-gray-500 font-bold uppercase tracking-widest border-b border-white/5">
              <tr>
                <th className="p-5">Event ID</th>
                <th className="p-5">Workflow ID</th>
                <th className="p-5">Reason</th>
                <th className="p-5">Retries</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {dlqItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <motion.tr 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="hover:bg-white/2 transition-colors group"
                    >
                      <td className="p-5 font-mono text-gray-300">
                        <button onClick={() => toggleRow(item.id)} className="flex items-center gap-2 hover:text-indigo-400 transition-colors cursor-pointer">
                          <motion.div animate={{ rotate: expandedRow === item.id ? 90 : 0 }}>
                            <ChevronRight className="w-4 h-4" />
                          </motion.div>
                          {item.id.slice(0, 8)}...
                        </button>
                      </td>
                      <td className="p-5 font-mono text-indigo-300">{item.payload?.workflowId || 'N/A'}</td>
                      <td className="p-5 text-red-400/90 font-mono truncate max-w-50" title={item.error}>{item.error}</td>
                      <td className="p-5">
                        <span className="bg-white/5 px-2.5 py-1 rounded-md font-bold">{item.retryCount}</span>
                      </td>
                      <td className="p-5 text-right">
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleReplay(item.id)}
                          disabled={isReplaying === item.id}
                          className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 ml-auto transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                        >
                          {isReplaying === item.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                          {isReplaying === item.id ? 'Queuing' : 'Replay'}
                        </motion.button>
                      </td>
                    </motion.tr>

                    <AnimatePresence>
                      {expandedRow === item.id && (
                        <tr>
                          <td colSpan={5} className="bg-black/20 p-0">
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="px-6 py-6 border-l-2 border-indigo-500"
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
                                      <span className={`font-bold ${hist.status === 'SUCCESS' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {hist.status}
                                      </span>
                                      <span className="text-gray-400">{hist.message}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-gray-600 italic">No replay history found for this event.</p>
                              )}
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
                {dlqItems.length === 0 && (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={5} className="p-12 text-center text-gray-600 font-mono text-xs uppercase tracking-widest">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-8 h-8 opacity-20" />
                        Queue is healthy & empty
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};