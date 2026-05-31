import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Copy, Check, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';
import { apiClient } from '../../../../core/api/client';
import { useSuccessStore } from '../../../../core/store/success.store';
import { useErrorStore } from '../../../../core/store/error.store';

export const ApiAuthentication = () => {
  const [apiKey, setApiKey] = useState('Loading...');
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  
  const showSuccess = useSuccessStore((state: any) => state.showSuccess);
  const showError = useErrorStore((state: any) => state.showError);

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
    if (!requiresConfirmation) {
      setRequiresConfirmation(true);
      setTimeout(() => setRequiresConfirmation(false), 3000);
      return;
    }

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
    <div className="bg-black/40 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col h-full relative overflow-hidden group">
      <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex flex-col h-full">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
          <Key size={14} className="text-indigo-400" /> API Authentication
        </h3>
        <p className="text-xs text-gray-500 mb-6 font-mono leading-relaxed">
          Use this key to authenticate external requests to your EventFlux webhooks. Keep it secure.
        </p>
        
        <div className="space-y-4 mt-auto">
          <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase">Production Key</label>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input 
                type="text" 
                readOnly 
                value={apiKey}
                className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-indigo-200 focus:outline-none shadow-inner"
              />
              <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyKey}
              className={`flex items-center cursor-pointer justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border w-24 shrink-0 ${
                copied 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </motion.button>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRotateKey}
            disabled={isRotating}
            className={`w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border disabled:opacity-50 ${
              requiresConfirmation 
                ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse' 
                : 'bg-transparent text-gray-500 border-white/5 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5'
            }`}
          >
            {isRotating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : requiresConfirmation ? (
              <AlertTriangle size={14} />
            ) : (
              <RotateCcw size={14} />
            )}
            {isRotating ? 'Rotating Key...' : requiresConfirmation ? 'Click again to confirm revoke' : 'Revoke & Regenerate Key'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};