import { useState, useEffect } from 'react';
import { apiClient } from '../../../../core/api/client';
import { useSuccessStore } from '../../../../core/store/success.store';
import { useErrorStore } from '../../../../core/store/error.store';

export const ApiAuthentication = () => {
  const [apiKey, setApiKey] = useState('Loading...');
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  
  const showSuccess = useSuccessStore(state => state.showSuccess);
  const showError = useErrorStore(state => state.showError);

  useEffect(() => {
    apiClient.get('/tenant/settings')
      .then(res => {
        if (res.data.apiKey) setApiKey(res.data.apiKey);
      })
      .catch(() => showError("Failed to load API key."));
  }, [showError]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRotateKey = async () => {
    // 1. First click: Ask for confirmation and start a 3-second reset timer
    if (!requiresConfirmation) {
      setRequiresConfirmation(true);
      setTimeout(() => setRequiresConfirmation(false), 3000);
      return;
    }

    // 2. Second click: Execute rotation
    setIsRotating(true);
    try {
      const res = await apiClient.post('/tenant/settings/rotate-key');
      setApiKey(res.data.apiKey);
      showSuccess("API Key successfully revoked and regenerated.");
      setRequiresConfirmation(false);
    } catch (error: any) {
      showError(error.response?.data?.error || "Failed to rotate API key.");
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">API Authentication</h3>
      <p className="text-sm text-gray-400 mb-6">
        Use this key to authenticate external requests to your EventFlux webhooks. Keep it secure.
      </p>
      
      <div className="space-y-3 mt-auto">
        <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Production Key</label>
        
        <div className="flex gap-3">
          <input 
            type="text" 
            readOnly 
            value={apiKey}
            className="flex-1 bg-[#141414] border border-white/10 rounded-lg px-4 py-2 text-sm font-mono text-gray-300 focus:outline-none"
          />
          <button 
            onClick={handleCopyKey}
            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors w-24"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <button 
          onClick={handleRotateKey}
          disabled={isRotating}
          className={`text-sm font-medium cursor-pointer transition-colors mt-2 disabled:opacity-50 ${
            requiresConfirmation 
              ? 'text-red-500 hover:text-red-400' 
              : 'text-red-400 hover:text-red-300'
          }`}
        >
          {isRotating ? 'Rotating Key...' : requiresConfirmation ? 'Click again to confirm revoke' : 'Revoke & Regenerate Key'}
        </button>
      </div>
    </div>
  );
};