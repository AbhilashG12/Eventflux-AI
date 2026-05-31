import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, Link2, Copy, ShieldCheck } from 'lucide-react';
import { useTeamInvites } from '../../hooks/useTeamInvites';
import { useSuccessStore } from '../../../../core/store/success.store';

export const TeamAccess = () => {
  const { generateInvite, generatedLink, isInviting } = useTeamInvites();
  const [email, setEmail] = useState('');
  const showSuccess = useSuccessStore((state: any) => state.showSuccess);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await generateInvite(email);
    if (success) setEmail('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    showSuccess("Secure link copied to clipboard!");
  };

  return (
    <div className="bg-black/40 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative z-10">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
          <Users size={14} className="text-purple-400" /> Team Access
        </h3>
        <p className="text-xs text-gray-500 mb-6 font-mono leading-relaxed">
          Generate a secure, single-use cryptographic link to add engineers to your workspace. Links expire in 7 days.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="engineer@company.com" 
              className="w-full bg-black/60 border border-white/10 hover:border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 focus:outline-none transition-all shadow-inner"
            />
            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isInviting}
            className="bg-linear-to-r from-purple-600 cursor-pointer to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all whitespace-nowrap shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2"
          >
            <Link2 size={14} /> {isInviting ? 'Generating...' : 'Generate Link'}
          </motion.button>
        </form>

        <AnimatePresence>
          {generatedLink && (
            <motion.div 
              initial={{ opacity: 0, y: -10, height: 0 }} 
              animate={{ opacity: 1, y: 0, height: 'auto' }} 
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between gap-4 shadow-inner">
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck size={12} /> Secure Invite Link Generated
                  </p>
                  <p className="text-purple-200/80 text-[11px] truncate font-mono bg-black/40 px-3 py-2 rounded-lg border border-purple-500/10">
                    {generatedLink}
                  </p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCopyLink} 
                  className="cursor-pointer bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/30 text-purple-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-2 mt-5"
                >
                  <Copy size={14} /> Copy
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};