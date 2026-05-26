export const TenantDetailsForm = () => (
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
);