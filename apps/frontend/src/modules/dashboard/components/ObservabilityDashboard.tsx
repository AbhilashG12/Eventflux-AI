import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, XCircle, Clock, Server, ArrowRight } from 'lucide-react';
import { apiClient } from '../../../core/api/client';
import { formatDistanceToNow } from 'date-fns'; 
import { ExecutionLogsDrawer } from '../../../components/ExecutionLogsDrawer';

interface DashboardData {
  stats: { totalRuns: number; successRate: number; failedRuns: number };
  recentExecutions: any[];
}

export const ObservabilityDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiClient.get('/executions/dashboard');
        setData(res.data);
      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-6 h-6 text-indigo-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-500 tracking-wider uppercase">Loading Telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Activity className="w-7 h-7 text-indigo-500" /> Telemetry & Logs
        </h2>
        <p className="text-gray-400 mt-1">Monitor execution health, traces, and real-time node outputs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Runs</span>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Activity size={18} /></div>
          </div>
          <span className="text-4xl font-bold text-white relative z-10">{data.stats.totalRuns.toLocaleString()}</span>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Success Rate</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><CheckCircle2 size={18} /></div>
          </div>
          <span className="text-4xl font-bold text-white relative z-10">{data.stats.successRate}%</span>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Failed Runs</span>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><XCircle size={18} /></div>
          </div>
          <span className="text-4xl font-bold text-white relative z-10">{data.stats.failedRuns.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Server size={16} className="text-indigo-400" />
            Execution Traces
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/20 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap">Workflow Name</th>
                <th className="px-6 py-4 whitespace-nowrap">Trace ID</th>
                <th className="px-6 py-4 whitespace-nowrap">Executed</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {data.recentExecutions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    No telemetry data found.
                  </td>
                </tr>
              ) : (
                data.recentExecutions.map((exec) => (
                  <tr key={exec.id} className="hover:bg-white/3 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        exec.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        exec.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {exec.status === 'COMPLETED' && <CheckCircle2 size={12} />}
                        {exec.status === 'FAILED' && <XCircle size={12} />}
                        {exec.status === 'RUNNING' && <Activity size={12} className="animate-pulse" />}
                        {exec.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-200">
                      {exec.workflow?.name || 'Untitled Workflow'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                      {exec.id.split('_')[1] || exec.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 flex items-center gap-2">
                      <Clock size={14} className="text-gray-500" />
                      {formatDistanceToNow(new Date(exec.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => setSelectedExecutionId(exec.id)}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-3 py-1.5 rounded transition-all inline-flex items-center gap-2 opacity-0 group-hover:opacity-100"
                      >
                        Inspect <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExecutionLogsDrawer 
        isOpen={!!selectedExecutionId} 
        executionId={selectedExecutionId}
        onClose={() => setSelectedExecutionId(null)} 
      />
    </div>
  );
};