import { useState } from 'react';
import { useTeamInvites } from '../../hooks/useTeamInvites';
import { useSuccessStore } from '../../../../core/store/success.store';

export const TeamAccess = () => {
  const { generateInvite, generatedLink, isInviting } = useTeamInvites();
  const [email, setEmail] = useState('');
  const showSuccess = useSuccessStore(state => state.showSuccess);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await generateInvite(email);
    if (success) setEmail('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    showSuccess("Link copied to clipboard!");
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Team Access</h3>
      <p className="text-sm text-gray-400 mb-6">
        Generate a secure, single-use cryptographic link to add engineers to your workspace. Links expire in 7 days.
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input 
          type="email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="engineer@company.com" 
          className="flex-1 bg-[#0a0a0a] border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
        />
        <button 
          type="submit" 
          disabled={isInviting}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap"
        >
          {isInviting ? 'Generating...' : 'Generate Link'}
        </button>
      </form>

      {generatedLink && (
        <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex-1 overflow-hidden">
            <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-1">Secure Invite Link</p>
            <p className="text-indigo-200 text-sm truncate font-mono">{generatedLink}</p>
          </div>
          <button 
            onClick={handleCopyLink} 
            className="bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
};