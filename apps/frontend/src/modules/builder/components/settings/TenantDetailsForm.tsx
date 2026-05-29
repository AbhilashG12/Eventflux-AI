import { useState, useEffect } from 'react';
import { apiClient } from '../../../../core/api/client';
import { useAuthStore } from '../../../../core/store/auth.store';
import { useSuccessStore } from '../../../../core/store/success.store';

export const TenantDetailsForm = () => {
  const tenantId = useAuthStore(state => state.user?.tenantId || 'Loading...');
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const showSuccess = useSuccessStore(state => state.showSuccess);

  useEffect(() => {
    apiClient.get('/tenant/settings').then(res => {
      if (res.data.name) setName(res.data.name);
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch('/tenant/settings', { name });
      showSuccess("Organization details updated successfully.");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Tenant Details</h3>
      <div className="space-y-5 mt-auto">
        <div>
          <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Organization Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Tenant ID</label>
          <input 
            type="text" 
            readOnly 
            value={tenantId}
            className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-2 text-sm font-mono text-gray-500 cursor-not-allowed"
          />
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};