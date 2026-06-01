import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Check, LayoutTemplate } from 'lucide-react';
import { useWorkflowStore } from '../core/store/workflow.store';

export const WorkflowTitle = () => {
  const name = useWorkflowStore((state: any) => state.name) || 'Untitled Workflow';
  const setName = useWorkflowStore((state: any) => state.setName);
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const finalName = tempName.trim() || 'Untitled Workflow';
    setName(finalName);
    setTempName(finalName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setTempName(name);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xl shadow-inner group">
      <div className="p-1.5 bg-indigo-500/10 rounded-lg">
        <LayoutTemplate className="w-4 h-4 text-indigo-400" />
      </div>

      <div className="relative flex items-center min-w-37.5">
        {isEditing ? (
          <input
            ref={inputRef}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-sm font-bold text-white outline-none w-full border-b border-indigo-500 pb-0.5"
          />
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-sm font-bold text-gray-200 hover:text-white transition-colors cursor-pointer"
          >
            <span className="truncate max-w-50">{name}</span>
            <Edit2 className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Check className="w-4 h-4 text-emerald-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};