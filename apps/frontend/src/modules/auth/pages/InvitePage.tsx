import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../core/api/client';
import { useErrorStore } from '../../../core/store/error.store';
import { useSuccessStore } from '../../../core/store/success.store';

export const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const showError = useErrorStore(state => state.showError);
  const showSuccess = useSuccessStore(state => state.showSuccess);
  
  const [inviteData, setInviteData] = useState<{ email: string; tenantName: string } | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/invites/${token}`)
      .then(({ data }) => {
        setInviteData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        showError(err.response?.data?.error || "Invalid or expired invite link");
        navigate('/login');
      });
  }, [token, navigate, showError]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/auth/register', {
        email: inviteData?.email,
        password: password,
        inviteToken: token
      });
      
      showSuccess("Successfully joined workspace! You can now login.");
      navigate('/login');
    } catch (err: any) {
      showError(err.response?.data?.error || "Failed to join workspace");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gray-500">Validating secure invite...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">Join {inviteData?.tenantName}</h2>
        <p className="text-gray-400 text-sm mb-8">You have been invited to collaborate on EventFlux.</p>
        
        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
            <input 
              disabled 
              value={inviteData?.email} 
              className="w-full mt-1.5 bg-black/50 border border-white/5 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed" 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Create Password</label>
            <input 
              required 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)} 
              className="w-full mt-1.5 bg-[#050505] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none transition-colors" 
              placeholder="••••••••" 
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors mt-4">
            Accept Invite & Join
          </button>
        </form>
      </div>
    </div>
  );
};