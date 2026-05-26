import { useState } from 'react';

export const ApiAuthentication = () => {
  const [apiKey] = useState('ef_live_8f7d6e5c4b3a2109');
  const [copied, setCopied] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
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
            onClick={handleCopyKey}
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
  );
};