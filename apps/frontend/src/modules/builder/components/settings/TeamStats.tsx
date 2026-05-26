export const TenantStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-gray-600 transition-colors">
      <span className="text-sm font-semibold tracking-wider text-gray-500 uppercase">Total Executions</span>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-5xl font-bold text-white">14,208</span>
        <span className="text-sm text-emerald-500 font-medium">+12% this week</span>
      </div>
    </div>
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-gray-600 transition-colors">
      <span className="text-sm font-semibold tracking-wider text-gray-500 uppercase">Success Rate</span>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-5xl font-bold text-white">99.8%</span>
        <span className="text-sm text-gray-400 font-medium">Last 30 days</span>
      </div>
    </div>
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-gray-600 transition-colors">
      <span className="text-sm font-semibold tracking-wider text-gray-500 uppercase">Active Workflows</span>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-5xl font-bold text-white">24</span>
        <span className="text-sm text-gray-400 font-medium">Across 3 environments</span>
      </div>
    </div>
  </div>
);