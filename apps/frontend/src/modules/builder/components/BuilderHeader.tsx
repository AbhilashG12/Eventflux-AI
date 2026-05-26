import { motion } from 'framer-motion';

interface BuilderHeaderProps {
  onSave: () => void;
  isSaving: boolean;
  onPublish: () => void;
  isPublishing: boolean;
  workflowStatus: string;
  onTestRun: () => void;
}

export const BuilderHeader = ({ 
  onSave, 
  isSaving, 
  onPublish, 
  isPublishing, 
  workflowStatus, 
  onTestRun 
}: BuilderHeaderProps) => {
  return (
    <div className="h-14 bg-[#0B061A]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">EF</span>
        </div>
        <h1 className="text-sm font-semibold tracking-wide text-gray-200">New Workflow</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
          workflowStatus === 'PUBLISHED' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        }`}>
          {workflowStatus}
        </div>
        <button 
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          {isSaving ? <span className="animate-spin text-purple-500">⌛</span> : '💾'} 
          Save Draft
        </button>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPublish}
          disabled={isPublishing}
          className="px-6 py-2 text-sm font-bold text-white bg-linear-to-r from-indigo-500 to-purple-600 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all flex items-center gap-2"
        >
          {isPublishing ? 'Publishing...' : '🚀 Publish Version'}
        </motion.button>
        
        <button 
          onClick={onTestRun}
          className="ml-2 px-4 py-2 text-sm font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-lg transition-colors flex items-center gap-2"
        >
          ▶ Test Run
        </button>
      </div>
    </div>
  );
};