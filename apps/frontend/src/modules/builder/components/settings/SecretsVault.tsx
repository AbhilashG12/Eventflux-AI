import { useState } from 'react';
import { motion, AnimatePresence,type Variants } from 'framer-motion';
import { Lock, Plus, Trash2, KeyRound, Server } from 'lucide-react';
import { useSecrets } from '../../hooks/useSecrets';

export const SecretsVault = () => {
  const { secrets, isLoading, isSubmitting, addSecret, deleteSecret } = useSecrets();
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;
    
    const success = await addSecret(name, value);
    if (success) {
      setName('');
      setValue('');
    }
  };

  const rowVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <div className="bg-black/40 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative z-10">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
          <Lock size={14} className="text-emerald-400" /> Encrypted Secrets Vault
        </h3>
        <p className="text-xs text-gray-500 mb-6 font-mono leading-relaxed max-w-2xl">
          Manage your encrypted integration keys and environment variables. These are stored with AES-256-GCM encryption and never exposed in plain text.
        </p>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Presets:</span>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => setName('RESEND_API_KEY')} className="cursor-pointer text-[10px] font-bold bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
            <Plus size={10} /> Resend
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => setName('GROQ_API_KEY')} className="cursor-pointer text-[10px] font-bold bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
            <Plus size={10} /> Groq AI
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => setName('SLACK_WEBHOOK_URL')} className="cursor-pointer text-[10px] font-bold bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border border-pink-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
            <Plus size={10} /> Slack
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end mb-8 bg-black/20 p-4 rounded-xl border border-white/5">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Secret Name</label>
            <div className="relative">
              <input 
                type="text" value={name} onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))} placeholder="e.g., API_KEY_PROD"
                className="w-full bg-black/60 border border-white/10 hover:border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none transition-all shadow-inner"
              />
              <Server size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Secure Value</label>
            <div className="relative">
              <input 
                type="password" value={value} onChange={(e) => setValue(e.target.value)} placeholder="••••••••••••••••"
                className="w-full bg-black/60 border border-white/10 hover:border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-emerald-300 tracking-widest font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none transition-all shadow-inner"
              />
              <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting || !name || !value}
            className="px-6 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all w-full sm:w-auto h-9.5 flex items-center justify-center gap-2"
          >
            <Plus size={14} /> {isSubmitting ? 'Encrypting...' : 'Add Secret'}
          </motion.button>
        </form>

        <div className="border border-white/5 rounded-xl overflow-hidden bg-black/40 shadow-inner">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="px-6 py-3.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Variable Name</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Added On</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-xs font-mono uppercase tracking-widest">Loading encrypted vault...</td>
                  </motion.tr>
                ) : secrets.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-xs font-mono uppercase tracking-widest">Vault is empty</td>
                  </motion.tr>
                ) : (
                  secrets.map(secret => (
                    <motion.tr 
                      key={secret.id} 
                      variants={rowVariants} initial="hidden" animate="show" exit="exit"
                      className="hover:bg-white/2 transition-colors group"
                    >
                      <td className="px-6 py-3.5">
                        <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md shadow-sm">
                          {secret.name}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-[11px] text-gray-500 font-mono">
                        {new Date(secret.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <motion.button 
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => deleteSecret(secret.id)}
                          className="cursor-pointer text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors inline-flex opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};