import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Activity, CheckCircle2, XCircle, Clock, Server, ArrowRight, Sparkles } from 'lucide-react';
import { apiClient } from '../../../core/api/client';
import { formatDistanceToNow } from 'date-fns'; 
import { ExecutionLogsDrawer } from '../../../components/ExecutionLogsDrawer';

interface DashboardData {
  stats: { totalRuns: number; successRate: number; failedRuns: number };
  recentExecutions: any[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  }
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

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
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12">
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl" />
            <Activity className="w-6 h-6 text-indigo-400 relative z-10" />
          </div>
          <motion.span 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-xs font-semibold text-gray-500 tracking-[0.2em] uppercase font-mono"
          >
            Syncing Telemetry...
          </motion.span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Runs",
      value: data.stats.totalRuns.toLocaleString(),
      icon: Activity,
      color: "text-indigo-400",
      bgHover: "group-hover:bg-indigo-500/10",
      borderHover: "group-hover:border-indigo-500/30",
      glow: "from-indigo-500/10",
      iconBg: "bg-indigo-500/10",
    },
    {
      title: "Success Rate",
      value: `${data.stats.successRate}%`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgHover: "group-hover:bg-emerald-500/10",
      borderHover: "group-hover:border-emerald-500/30",
      glow: "from-emerald-500/10",
      iconBg: "bg-emerald-500/10",
    },
    {
      title: "Failed Runs",
      value: data.stats.failedRuns.toLocaleString(),
      icon: XCircle,
      color: "text-red-400",
      bgHover: "group-hover:bg-red-500/10",
      borderHover: "group-hover:border-red-500/30",
      glow: "from-red-500/10",
      iconBg: "bg-red-500/10",
    }
  ];

  // Custom minimalist scrollbar styling
  const scrollbarStyles = "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full";

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`max-w-7xl mx-auto w-full relative z-10 ${scrollbarStyles}`}
    >
      <motion.div variants={itemVariants} className="mb-10">
        <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          Telemetry & Logs
        </h2>
        <p className="text-sm text-gray-500 mt-2 font-mono tracking-wide">Monitor execution health, traces, and real-time node outputs.</p>
      </motion.div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            className={`group relative bg-black/40 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 ${stat.borderHover}`}
          >
            <div className={`absolute inset-0 bg-linear-to-br ${stat.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">{stat.title}</span>
              <div className={`p-2 ${stat.iconBg} rounded-xl ${stat.color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon size={16} />
              </div>
            </div>
            
            <span className="text-4xl font-semibold text-gray-100 tracking-tight relative z-10 drop-shadow-sm">
              {stat.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* TRACES TABLE */}
      <motion.div variants={itemVariants} className="bg-black/40 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative">
        
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />

        <div className="px-6 py-5 border-b border-white/5 bg-white/2 flex justify-between items-center">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Server size={14} className="text-indigo-400" />
            Execution Traces
          </h2>
        </div>
        
        <div className={`overflow-x-auto ${scrollbarStyles}`}>
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/20 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-white/5">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap">Workflow Name</th>
                <th className="px-6 py-4 whitespace-nowrap">Trace ID</th>
                <th className="px-6 py-4 whitespace-nowrap">Executed</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              <AnimatePresence mode="popLayout">
                {data.recentExecutions.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Sparkles className="w-8 h-8 opacity-20" />
                        <span className="text-xs font-mono tracking-widest uppercase">No telemetry data found</span>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  data.recentExecutions.map((exec, idx) => (
                    <motion.tr 
                      key={exec.id} 
                      variants={rowVariants}
                      initial="hidden"
                      animate="show"
                      custom={idx}
                      className="hover:bg-white/2 transition-colors group relative"
                    >
                      <td className="px-6 py-4 whitespace-nowrap relative z-10">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                          exec.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                          exec.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                        }`}>
                          {exec.status === 'COMPLETED' && <CheckCircle2 size={10} />}
                          {exec.status === 'FAILED' && <XCircle size={10} />}
                          {exec.status === 'RUNNING' && <Activity size={10} className="animate-pulse" />}
                          {exec.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-300 relative z-10">
                        {exec.workflow?.name || 'Untitled Workflow'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-[11px] relative z-10">
                        {exec.id.split('_')[1] || exec.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400 flex items-center gap-2 text-xs relative z-10">
                        <Clock size={12} className="text-gray-500" />
                        {formatDistanceToNow(new Date(exec.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right relative z-10">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedExecutionId(exec.id)}
                          className="cursor-pointer text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/15 border border-indigo-500/10 px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                        >
                          Inspect <ArrowRight size={12} />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* RENDER THE DRAWER VIA PORTAL OR ENSURE IT'S AT THE ROOT LEVEL */}
      <ExecutionLogsDrawer 
        isOpen={!!selectedExecutionId} 
        executionId={selectedExecutionId}
        onClose={() => setSelectedExecutionId(null)} 
      />
    </motion.div>
  );
};