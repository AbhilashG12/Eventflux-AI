import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Fingerprint, Save, Loader2 } from 'lucide-react';
import { apiClient } from '../../../../core/api/client';
import { useAuthStore } from '../../../../core/store/auth.store';
import { useSuccessStore } from '../../../../core/store/success.store';

export const TenantDetailsForm = () => {
  const tenantId = useAuthStore((state: any) => state.user?.tenantId || 'Loading...');
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const showSuccess = useSuccessStore((state: any) => state.showSuccess);

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
    <div className="bg-black/40 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col h-full relative overflow-hidden group">
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex flex-col h-full">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
          <Building2 size={14} className="text-blue-400" /> Tenant Details
        </h3>
        <p className="text-xs text-gray-500 mb-6 font-mono leading-relaxed">
          Manage your organizational profile and identifier used across the platform.
        </p>

        <div className="space-y-5 mt-auto">
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">Organization Name</label>
            <div className="relative">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/60 border border-white/10 hover:border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all shadow-inner"
              />
              <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">Tenant ID</label>
            <div className="relative">
              <input 
                type="text" 
                readOnly 
                value={tenantId}
                className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-gray-500 cursor-not-allowed shadow-inner"
              />
              <Fingerprint size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl disabled:opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};