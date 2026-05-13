import { useState } from 'react';

export const TenantDashboard = () => {
  const [apiKey] = useState('ef_live_8f7d6e5c4b3a2109');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
      
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Organization Settings</h1>
        <p className="text-gray-400 mt-2">Manage your API keys, view usage, and configure tenant details.</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">API Authentication</h3>
          <p className="text-sm text-gray-400 mb-6">
            Use this key to authenticate external requests to your EventFlux webhooks. Keep it secure.
          </p>
          
          <div className="space-y-3">
            <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Production Key</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                readOnly 
                value={apiKey}
                className="flex-1 bg-[#0a0a0a] border border-border rounded-lg px-4 py-2 text-sm font-mono text-gray-300 focus:outline-none"
              />
              <button 
                onClick={handleCopy}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors w-24"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button className="text-sm text-red-400 hover:text-red-300 transition-colors mt-2 font-medium">
              Revoke & Regenerate Key
            </button>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Tenant Details</h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Organization Name</label>
              <input 
                type="text" 
                defaultValue="Acme Corp"
                className="w-full bg-[#0a0a0a] border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Tenant ID</label>
              <input 
                type="text" 
                readOnly 
                value="tenant_req9384nfj"
                className="w-full bg-[#0a0a0a] border border-border rounded-lg px-4 py-2 text-sm font-mono text-gray-500 cursor-not-allowed"
              />
            </div>

            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};