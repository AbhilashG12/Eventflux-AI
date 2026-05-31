import { motion, type Variants } from 'framer-motion';
import { Activity, CheckCircle2, Clock, Zap, BarChart3 } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAuthStore } from '../../../core/store/auth.store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export const AnalyticsDashboard = () => {
  const tenantId = useAuthStore((state: any) => state.user?.tenantId);
  const { metrics, chartData } = useAnalytics(tenantId || '');

  const statCards = [
    {
      title: "Total Executions",
      value: metrics?.totalRuns?.toLocaleString() || "0",
      icon: Activity,
      color: "text-indigo-400",
      bgHover: "group-hover:bg-indigo-500/10",
      borderHover: "group-hover:border-indigo-500/30",
      glow: "from-indigo-500/10",
      iconBg: "bg-indigo-500/10",
    },
    {
      title: "Success Rate",
      value: `${metrics?.successRate || 0}%`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgHover: "group-hover:bg-emerald-500/10",
      borderHover: "group-hover:border-emerald-500/30",
      glow: "from-emerald-500/10",
      iconBg: "bg-emerald-500/10",
    },
    {
      title: "Avg Duration",
      value: `${metrics?.avgDuration || 0}s`,
      icon: Clock,
      color: "text-blue-400",
      bgHover: "group-hover:bg-blue-500/10",
      borderHover: "group-hover:border-blue-500/30",
      glow: "from-blue-500/10",
      iconBg: "bg-blue-500/10",
    },
    {
      title: "Active Workflows",
      value: metrics?.activeWorkflows?.toLocaleString() || "0",
      icon: Zap,
      color: "text-amber-400",
      bgHover: "group-hover:bg-amber-500/10",
      borderHover: "group-hover:border-amber-500/30",
      glow: "from-amber-500/10",
      iconBg: "bg-amber-500/10",
    }
  ];

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
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          Platform Analytics
        </h2>
        <p className="text-sm text-gray-500 mt-2 font-mono tracking-wide">Real-time metrics, execution volume, and tenant usage.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`group relative bg-black/40 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 ${stat.borderHover}`}
          >
            <div className={`absolute inset-0 bg-linear-to-br ${stat.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">{stat.title}</span>
              <div className={`p-2 ${stat.iconBg} rounded-xl ${stat.color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon size={16} />
              </div>
            </div>
            
            <span className="text-4xl font-semibold text-gray-100 tracking-tight relative z-10 drop-shadow-sm font-mono">
              {stat.value}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="bg-black/40 backdrop-blur-2xl border border-white/5 rounded-2xl h-112.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden">
        
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />

        <div className="px-6 py-5 border-b border-white/5 bg-white/2 flex justify-between items-center relative z-10">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-emerald-400" />
            Live Execution Volume
          </h3>
        </div>

        <div className="flex-1 w-full min-h-0 p-6 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#555" 
                fontSize={11} 
                fontFamily="monospace"
                tickLine={false} 
                axisLine={false} 
                dy={10} 
              />
              <YAxis 
                stroke="#555" 
                fontSize={11} 
                fontFamily="monospace"
                tickLine={false} 
                axisLine={false} 
                dx={-10} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(10, 10, 10, 0.8)', 
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}
                labelStyle={{ color: '#888', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
              <Area 
                type="monotone" 
                dataKey="success" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorSuccess)" 
                activeDot={{ r: 6, fill: '#10b981', stroke: '#050505', strokeWidth: 2 }} 
                name="Successful Runs" 
              />
              <Area 
                type="monotone" 
                dataKey="failed" 
                stroke="#ef4444" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorFailed)" 
                activeDot={{ r: 6, fill: '#ef4444', stroke: '#050505', strokeWidth: 2 }} 
                name="Failed Runs" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
};