import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, UserCheck, CopyPlus, Library } from 'lucide-react';
import { apiClient } from '../../../core/api/client';
import { useSuccessStore } from '../../../core/store/success.store';
import { useWorkflowStore } from '../../../core/store/workflow.store'; 

const ICONS: Record<string, any> = { Sparkles, UserCheck, Library };
const scrollbarStyles = "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full";

interface TemplateGalleryProps {
  setActiveView: (view: any) => void;
}

export const TemplateGallery = ({ setActiveView }: TemplateGalleryProps) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const showSuccess = useSuccessStore(state => state.showSuccess);
  
  // Pull all required setters from the global store
  const setWorkflow = useWorkflowStore(state => (state as any).setWorkflow);
  const setWorkflowId = useWorkflowStore(state => state.setWorkflowId);
  const setName = useWorkflowStore(state => state.setName);

  useEffect(() => {
    apiClient.get('/templates')
      .then(({ data }) => setTemplates(data))
      .catch(err => console.error("🔴 Backend Template Route unreachable:", err));
  }, []);

  const handleUseTemplate = async (template: any) => {
    try {
      // 1. Post to backend to clone the record in PostgreSQL
      const { data } = await apiClient.post(`/templates/${template.id}/clone`);
      
      if (data.success) {
        showSuccess("Template cloned successfully!");
        
        // 2. Populate the canvas store using the definition returned in the POST request
        if (data.definition) {
          setWorkflowId(data.workflowId);
          setName(`${template.name} (Copy)`);
          setWorkflow(data.definition.nodes || [], data.definition.edges || []);
        }
        
        // 3. Switch view to the canvas layout
        setActiveView('BUILDER');
      }
    } catch (error: any) {
      console.error("❌ Failed to clone template via API:", error.response?.data || error.message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className={`max-w-7xl mx-auto p-6 h-full flex flex-col ${scrollbarStyles}`}
    >
      <div className="mb-8 shrink-0">
        <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Library className="w-5 h-5 text-indigo-400" />
          </div>
          Template Gallery
        </h2>
        <p className="text-sm text-gray-500 mt-2 font-mono tracking-wide">
          Quickstart your automation by cloning a pre-built enterprise workflow.
        </p>
      </div>

      <div className={`flex-1 overflow-y-auto pr-2 pb-20 ${scrollbarStyles}`}>
        {templates.length === 0 ? (
          <div className="text-xs font-mono text-gray-500">Loading templates from backend server... Check terminal if stuck.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((tpl) => {
              const Icon = ICONS[tpl.icon] || CopyPlus;
              return (
                <motion.div 
                  key={tpl.id}
                  whileHover={{ y: -5 }}
                  className="p-6 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-2xl flex flex-col justify-between group shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-white/10 transition-colors"
                >
                  <div>
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 mb-4 text-indigo-400">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{tpl.name}</h3>
                    <p className="text-sm text-gray-400 font-mono leading-relaxed">{tpl.description}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleUseTemplate(tpl)} 
                    className="mt-8 w-full py-3 bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2"
                  >
                    <CopyPlus size={16} />
                    Use This Template
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};