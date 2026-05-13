import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../core/api/client';
import { useAuthStore } from '../../../core/store/auth.store';

export const OnboardingPage = () => {
  const [tenantName, setTenantName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login, token } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await apiClient.post('/api/tenant', { name: tenantName });
      if (user && token) {
        login(token, { ...user, tenantId: data.tenantId });
      }
      navigate('/');
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 border border-border bg-surface rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <span className="text-emerald-500 font-bold text-xl">✓</span>
          </div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Account Created</h2>
          <p className="text-sm text-gray-400 mt-2">Let's set up your primary workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Organization Name</label>
            <input
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full bg-[#0a0a0a] border border-border rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !tenantName}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Configuring...' : 'Go to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};