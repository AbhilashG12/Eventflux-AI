import { motion } from 'framer-motion';
import { Activity, LogOut, Save, Rocket, Play, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../core/store/auth.store';

interface BuilderHeaderProps {
  onSave: () => void;
  isSaving: boolean;
  onPublish: () => void;
  isPublishing: boolean;
  workflowStatus: string;
  onTestRun: () => void;
  onToggleLogs?: () => void;
}

export const BuilderHeader = ({ 
  onSave, 
  isSaving, 
  onPublish, 
  isPublishing, 
  workflowStatus, 
  onTestRun,
  onToggleLogs 
}: BuilderHeaderProps) => {
  const logout = useAuthStore((state: any) => state.logout);

  const isPublished = workflowStatus === 'PUBLISHED';

  return (
    <header className="h-16 bg-[#0a0a0a]/40 backdrop-blur-2xl border-b border-white/8 flex items-center justify-between px-6 z-50 sticky top-0">
      
      {/* Left side: Branding */}
      <div className="flex items-center gap-4">
        <div className="relative group cursor-default">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-md group-hover:bg-indigo-500/40 transition-colors duration-500" />
          <div className="relative w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/10 shadow-lg">
            <span className="text-white font-bold text-xs tracking-wider">EF</span>
          </div>
        </div>
        <div className="flex flex-col cursor-default">
          <h1 className="text-sm font-medium text-gray-200 leading-tight">New Workflow</h1>
          <span className="text-[10px] text-gray-500 font-mono tracking-wide">Workspace / Canvas</span>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-3">
        
        {/* Status Badge with Pulse */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest border cursor-default ${
          isPublished 
            ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' 
            : 'bg-amber-500/5 text-amber-400 border-amber-500/20'
        }`}>
          {isPublished && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          )}
          {!isPublished && <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />}
          {workflowStatus || 'DRAFT'}
        </div>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* View Logs Button */}
        {onToggleLogs && (
          <motion.button 
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onToggleLogs}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-transparent border border-white/10 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20 transition-colors"
          >
            <Activity size={14} className="text-blue-400" />
            Logs
          </motion.button>
        )}

        {/* Save Draft Button */}
        <motion.button 
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSave}
          disabled={isSaving}
          className="cursor-pointer flex items-center gap-2 px-4 py-1.5 bg-transparent rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin text-indigo-400" /> : <Save size={14} />} 
          Save Draft
        </motion.button>

        {/* Test Run Button */}
        <motion.button 
          whileHover={{ y: -1, backgroundColor: 'rgba(99, 102, 241, 0.15)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onTestRun}
          className="cursor-pointer flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg transition-colors"
        >
          <Play size={12} className="fill-indigo-400 text-indigo-400" />
          Test Run
        </motion.button>

        {/* Publish Button */}
        <motion.button 
          whileHover={{ y: -1, filter: 'brightness(1.1)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onPublish}
          disabled={isPublishing}
          className="cursor-pointer relative group flex items-center gap-2 px-5 py-1.5 text-xs font-semibold text-white bg-linear-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden border border-white/10"
        >
          {/* Subtle inner highlight */}
          <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent opacity-50" />
          <span className="relative flex items-center gap-2">
            {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
            Publish
          </span>
        </motion.button>
        
        <div className="w-px h-5 bg-white/10 mx-1" />
        
        {/* Logout */}
        <motion.button 
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          title="Sign Out"
          className="cursor-pointer p-1.5 text-gray-500 hover:text-red-400 rounded-lg transition-colors flex items-center justify-center"
        >
          <LogOut size={16} />
        </motion.button>

      </div>
    </header>
  );
};