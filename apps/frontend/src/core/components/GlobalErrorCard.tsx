import { motion, AnimatePresence } from 'framer-motion';
import { useErrorStore } from '../store/error.store';

export const GlobalErrorCard = () => {
  const { message, clearError } = useErrorStore();

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
          exit={{ opacity: 0, y: -20, scale: 0.95, x: '-50%' }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-6 left-1/2 z-100 min-w-[320px] max-w-md bg-red-500/10 border border-red-500/30 backdrop-blur-2xl p-4 rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.2)] flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            <span className="text-red-500 font-bold text-lg">!</span>
          </div>
          
          <div className="flex-1 pt-0.5">
            <h4 className="text-red-400 font-semibold text-sm tracking-tight">System Error</h4>
            <p className="text-red-200/80 text-xs mt-1 leading-relaxed wrap-break-words">{message}</p>
          </div>
          
          <button 
            onClick={clearError} 
            className="text-red-400/50 hover:text-red-400 transition-colors p-1"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};