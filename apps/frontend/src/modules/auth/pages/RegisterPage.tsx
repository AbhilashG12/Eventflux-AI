import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Building2, Mail, Lock, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../core/api/client';
import { useAuthStore } from '../../../core/store/auth.store';

// Staggered animation setup
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  }
};

export const RegisterPage = () => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state: any) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await apiClient.post('/auth/register', { 
        email, 
        password, 
        companyName 
      });
      
      login(data.token, data.user);
      navigate('/'); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-[#050505] overflow-hidden font-sans">
      
      {/* Animated Ambient Background Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" 
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-40 mix-blend-overlay pointer-events-none" />

      {/* Main Glassmorphism Card - IMPROVED DEPTH & CONTRAST */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-md p-10 bg-[#0d0d0f]/90 border border-white/10 rounded-3xl backdrop-blur-2xl shadow-[0_24px_60px_-10px_rgba(0,0,0,0.8),_0_0_40px_rgba(168,85,247,0.1),_inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/5"
      >
        <div className="mb-10 text-center">
          <motion.div variants={itemVariants} className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] relative overflow-hidden group border border-white/10">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="text-white font-bold text-2xl tracking-tighter relative z-10">EF</span>
          </motion.div>
          <motion.h2 variants={itemVariants} className="text-3xl font-semibold text-white tracking-tight">
            Start building
          </motion.h2>
          <motion.p variants={itemVariants} className="text-sm text-gray-400 mt-3 font-mono tracking-wide">
            Deploy intelligent workflows in minutes
          </motion.p>
        </div>

        {/* Smooth Error Reveal */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs tracking-wide text-center font-bold flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <motion.div variants={itemVariants} className="space-y-2 relative">
            <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase ml-1">Organization Name</label>
            <div className="relative group">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-black/60 border border-white/10 hover:border-white/20 rounded-xl pl-12 pr-5 py-4 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 focus:outline-none transition-all shadow-inner placeholder:text-gray-600"
                placeholder="Acme Corp"
                required
              />
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2 relative">
            <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase ml-1">Email Address</label>
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/60 border border-white/10 hover:border-white/20 rounded-xl pl-12 pr-5 py-4 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 focus:outline-none transition-all shadow-inner placeholder:text-gray-600"
                placeholder="name@company.com"
                required
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2 relative">
            <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase ml-1">Password</label>
            <div className="relative group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/60 border border-white/10 hover:border-white/20 rounded-xl pl-12 pr-5 py-4 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 focus:outline-none transition-all shadow-inner placeholder:text-gray-600 tracking-widest"
                placeholder="••••••••"
                required
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 group cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        <motion.p variants={itemVariants} className="mt-8 text-center text-xs text-gray-500 font-medium font-mono">
          Already have an account?{' '}
          <Link to="/login" className="text-white hover:text-purple-400 font-bold transition-colors underline decoration-white/20 underline-offset-4">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};