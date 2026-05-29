import { Activity, CheckCircle2, Clock, Zap } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAuthStore } from '../../../core/store/auth.store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AnalyticsDashboard = () => {
  const tenantId = useAuthStore(state => state.user?.tenantId);
  const { metrics, chartData } = useAnalytics(tenantId || '');

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Activity className="w-7 h-7 text-indigo-500" /> Platform Analytics
        </h2>
        <p className="text-gray-400 mt-1">Real-time metrics, execution volume, and tenant usage.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium">Total Executions</span>
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-3xl font-bold text-white">{metrics?.totalRuns?.toLocaleString() || 0}</span>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium">Success Rate</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-3xl font-bold text-white">{metrics?.successRate || 0}%</span>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium">Avg Duration</span>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-3xl font-bold text-white">{metrics?.avgDuration || 0}s</span>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium">Active Workflows</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-3xl font-bold text-white">{metrics?.activeWorkflows || 0}</span>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl h-100 shadow-lg flex flex-col">
        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" /> Live Execution Volume
        </h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#666" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10} 
              />
              <YAxis 
                stroke="#666" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dx={-10} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f0f0f', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}
                labelStyle={{ color: '#888', marginBottom: '4px' }}
              />
              <Line 
                type="monotone" 
                dataKey="success" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#0a0a0a', strokeWidth: 2 }} 
                name="Successful Runs" 
              />
              <Line 
                type="monotone" 
                dataKey="failed" 
                stroke="#ef4444" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#ef4444', stroke: '#0a0a0a', strokeWidth: 2 }} 
                name="Failed Runs" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};