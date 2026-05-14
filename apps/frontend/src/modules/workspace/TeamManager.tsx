import { useState } from 'react';
import { apiClient } from '../../core/api/client';
import { useErrorStore } from '../../core/store/error.store';
import { useSuccessStore } from '../../core/store/success.store';

export const TeamManager = () => {
  const [email, setEmail] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const showError = useErrorStore(state => state.showError);
  const showSuccess = useSuccessStore(state => state.showSuccess);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await apiClient.post('/invites', { email });
      setGeneratedLink(data.inviteLink);
      showSuccess(`Invite generated for ${email}`);
      setEmail('');
    } catch (err: any) {
      showError(err.response?.data?.error || "Failed to send invite");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    showSuccess("Link copied to clipboard!");
  };

  return (
    <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-xl max-w-2xl shadow-xl">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white">Invite Team Members</h3>
        <p className="text-sm text-gray-400 mt-1">
          Generate a secure, single-use cryptographic link to add engineers to your workspace. Links expire in 7 days.
        </p>
      </div>
      
      <form onSubmit={handleInvite} className="flex gap-3">
        <input 
          type="email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="engineer@company.com" 
          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500 transition-colors"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-6 py-2.5 rounded-lg text-white font-medium transition-colors whitespace-nowrap"
        >
          {isLoading ? 'Generating...' : 'Generate Link'}
        </button>
      </form>

      {generatedLink && (
        <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex-1 overflow-hidden">
            <p className="text-xs text-indigo-300 font-medium uppercase tracking-wider mb-1">Secure Invite Link</p>
            <p className="text-indigo-200 text-sm truncate font-mono">{generatedLink}</p>
          </div>
          <button 
            onClick={copyToClipboard} 
            className="bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-4 py-2 rounded text-sm font-medium transition-colors shrink-0"
          >
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
};