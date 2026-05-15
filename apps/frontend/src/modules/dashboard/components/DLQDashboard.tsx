import { ShieldAlert, RefreshCw, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { useDLQ } from '../hooks/useDLQ';

export const DLQDashboard = () => {
  const { dlqItems, expandedRow, isReplaying, handleReplay, toggleRow } = useDLQ();

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in h-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-red-500" /> Dead Letter Queue
          </h2>
          <p className="text-gray-400 mt-1">Review, debug, and safely replay failed background events.</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#111] text-gray-400 border-b border-white/10">
              <tr>
                <th className="p-4 font-semibold">Event ID</th>
                <th className="p-4 font-semibold">Workflow ID</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Retries</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {dlqItems.map((item) => (
                <optgroup key={item.id} className="contents">
                  <tr className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 font-mono text-xs max-w-37.5 truncate" title={item.id}>
                      <button onClick={() => toggleRow(item.id)} className="flex items-center gap-2 hover:text-white">
                        {expandedRow === item.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        {item.id.split('-')[0]}...
                      </button>
                    </td>
                    <td className="p-4 font-mono text-xs text-indigo-300 truncate max-w-37.5">
                      {item.payload?.workflowId || 'N/A'}
                    </td>
                    <td className="p-4 text-red-400 truncate max-w-62.5" title={item.error}>
                      {item.error}
                    </td>
                    <td className="p-4">
                      <span className="bg-white/10 px-2.5 py-1 rounded-full text-xs font-bold">
                        {item.retryCount}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleReplay(item.id)}
                        disabled={isReplaying === item.id}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg font-medium text-xs flex items-center gap-2 transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isReplaying === item.id ? 'animate-spin' : ''}`} />
                        {isReplaying === item.id ? 'Queuing...' : 'Replay'}
                      </button>
                    </td>
                  </tr>

                  {expandedRow === item.id && (
                    <tr className="bg-[#111]">
                      <td colSpan={5} className="p-6 border-l-2 border-indigo-500">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Activity className="w-4 h-4" /> Replay Audit Log
                        </h4>
                        {item.history?.length > 0 ? (
                          <div className="space-y-3">
                            {item.history.map((hist: any) => (
                              <div key={hist.id} className="flex items-center gap-4 text-xs bg-black/40 p-3 rounded-lg border border-white/5">
                                <span className="text-gray-500 w-32">{new Date(hist.replayedAt).toLocaleString()}</span>
                                <span className="text-gray-300 w-32 truncate" title={hist.userId}>User: {hist.userId.split('-')[0]}</span>
                                <span className={`font-bold w-20 ${hist.status === 'SUCCESS' ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {hist.status}
                                </span>
                                <span className="text-gray-400">{hist.message}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600">No replay history found for this event.</p>
                        )}
                      </td>
                    </tr>
                  )}
                </optgroup>
              ))}
              {dlqItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    The DLQ is completely empty. Your systems are healthy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};