import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Copy, Code2, Plus, Zap, MessageSquare, Sparkles, Globe, Mail, ChevronDown } from 'lucide-react';
import { useWorkflowStore } from '../../../core/store/workflow.store';
import { useNodeConfig } from '../hooks/useNodeConfig';
import { ConfigHeader } from './config-panel/ConfigHeader';
import { copyText } from '../../../core/utils/clipboard';
import { useErrorStore } from '../../../core/store/error.store';
import { useSuccessStore } from '../../../core/store/success.store';

export const ConfigPanel = () => {
  const { selectedNodeId, workflowId } = useWorkflowStore();
  const showError = useErrorStore((state: any) => state.showError);
  const showSuccess = useSuccessStore((state: any) => state.showSuccess);
  
  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { 
    selectedNode, actionType, config, label, 
    pickerTarget, setPickerTarget, setActiveInput, 
    handleConfigChange, handleActionTypeChange, 
    insertVariable, availableVars 
  } = useNodeConfig(selectedNodeId);

  if (!selectedNode) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-80 bg-[#0a0a0a]/60 backdrop-blur-3xl border-l border-white/8 p-8 flex flex-col items-center justify-center text-center shadow-[-10px_0_30px_rgba(0,0,0,0.2)] z-20 h-full"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center mb-4 shadow-inner">
          <Settings size={28} className="text-gray-600 animate-[spin_10s_linear_infinite]" />
        </div>
        <h3 className="text-sm font-semibold text-gray-300 tracking-wide">No Node Selected</h3>
        <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
          Click on any node in the canvas to configure its triggers, actions, and parameters.
        </p>
      </motion.div>
    );
  }

  const inputProps = (field: string, isNumber: boolean = false) => ({
    value: config[field] || (isNumber ? 0 : ''),
    onChange: (e: any) => handleConfigChange(field, isNumber ? (parseInt(e.target.value) || 0) : e.target.value),
    onSelect: (e: any) => setActiveInput({ field, cursorIndex: e.currentTarget.selectionStart })
  });

  const isTrigger = selectedNode.type === 'TRIGGER';
  const nodeOptions = isTrigger ? [
    { id: 'webhook_trigger', label: 'Webhook URL', icon: Globe, color: 'text-emerald-400' },
    { id: 'cron_trigger', label: 'Cron Schedule', icon: Settings, color: 'text-purple-400' },
    { id: 'manual_trigger', label: 'Manual / API Trigger', icon: Zap, color: 'text-amber-400' },
  ] : [
    { id: 'ai_generate', label: 'Llama 3.1 (8B Fast)', icon: Sparkles, color: 'text-indigo-400' },
    { id: 'slack_message', label: 'Send Slack Message', icon: MessageSquare, color: 'text-pink-400' },
    { id: 'http_request', label: 'HTTP Request', icon: Globe, color: 'text-blue-400' },
    { id: 'email_send', label: 'Send Email', icon: Mail, color: 'text-orange-400' },
  ];

  const currentSelectedOption = nodeOptions.find(opt => opt.id === actionType);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-80 bg-[#0a0a0a]/60 backdrop-blur-3xl border-l border-white/8 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.3)] relative z-20 h-full"
    >
      <ConfigHeader label={label} nodeId={selectedNode.id} workflowId={workflowId || undefined} />

      {/* Increased padding bottom to ensure dropdown doesn't get cut off */}
      <div className="p-5 flex-1 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-32">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2 relative z-50"
        >
          <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {isTrigger ? <Zap size={12} className="text-amber-500" /> : <Settings size={12} className="text-blue-500" />}
            {isTrigger ? 'Trigger Type' : 'Action Type'}
          </label>
          
          {/* CUSTOM ANIMATED DROPDOWN */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:outline-none transition-all shadow-inner cursor-pointer"
            >
              {currentSelectedOption ? (
                <div className="flex items-center gap-2">
                  <currentSelectedOption.icon size={14} className={currentSelectedOption.color} />
                  <span className="font-medium">{currentSelectedOption.label}</span>
                </div>
              ) : (
                <span className="text-gray-500 italic">Select a type...</span>
              )}
              <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <ChevronDown size={14} className="text-gray-500" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-[#141414]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-100"
                >
                  <div className="px-3 py-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-black/40 border-b border-white/5">
                    {isTrigger ? '⚡ Triggers' : '⚙️ Actions'}
                  </div>
                  <div className="p-1">
                    {nodeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          handleActionTypeChange(opt.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-lg transition-colors cursor-pointer ${
                          actionType === opt.id 
                            ? 'bg-white/10 text-white font-medium' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                        }`}
                      >
                        <opt.icon size={14} className={opt.color} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {actionType && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 -z-10 bg-indigo-500/5 blur-xl rounded-full"
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* The rest of the form components stay exactly the same */}
        <AnimatePresence mode="wait">
          
          {actionType === 'webhook_trigger' && (
            <motion.div 
              key="webhook"
              initial={{ opacity: 0, y: 15, scale: 0.98 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="p-4 bg-emerald-500/3 border border-emerald-500/20 rounded-xl flex flex-col gap-3 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <Globe size={12} /> Webhook URL
              </span>
              <div className="bg-black/60 p-2.5 rounded-lg border border-white/5 flex items-center justify-between gap-2 group-hover:border-emerald-500/30 transition-colors shadow-inner">
                <code className="text-[10px] text-emerald-300/80 overflow-hidden text-ellipsis font-mono tracking-tight">
                  {workflowId ? `.../api/webhooks/${workflowId}` : 'Save to generate URL'}
                </code>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    if (!workflowId) {
                      showError("Please save the workflow first.");
                      return;
                    }
                    const url = `${window.location.protocol}//${window.location.hostname}:3001/api/webhooks/${workflowId}`;
                    const success = await copyText(url);
                    success ? showSuccess("Webhook URL Copied!") : showError("Failed to copy URL.");
                  }}
                  className="cursor-pointer flex items-center gap-1 text-[9px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap border border-emerald-500/10"
                >
                  <Copy size={10} /> Copy
                </motion.button>
              </div>
              <p className="text-[9px] text-emerald-500/50 leading-relaxed">Send a POST request to this URL to trigger the workflow execution.</p>
            </motion.div>
          )}

          {actionType === 'cron_trigger' && (
            <motion.div 
              key="cron"
              initial={{ opacity: 0, y: 15, scale: 0.98 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="p-4 bg-purple-500/3 border border-purple-500/20 rounded-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
              <label className="flex items-center gap-2 text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-3">
                <Settings size={12} /> Cron Schedule
              </label>
              <input 
                type="text"
                placeholder="*/5 * * * *"
                className="w-full bg-black/60 border border-white/5 hover:border-white/10 rounded-lg px-3 py-2 text-xs text-purple-200 font-mono focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 focus:outline-none transition-all shadow-inner"
                {...inputProps('cronString')}
              />
              <p className="text-[9px] text-purple-400/50 mt-2 font-mono">Example: <code className="bg-purple-500/10 px-1 py-0.5 rounded text-purple-300">0 * * * *</code> runs every hour.</p>
            </motion.div>
          )}

          {actionType === 'ai_generate' && (
            <motion.div 
              key="ai"
              initial={{ opacity: 0, y: 15, scale: 0.98 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Sparkles size={12} className="text-indigo-400" /> System Prompt
                  </label>
                  
                  <div className="relative">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPickerTarget(pickerTarget === 'prompt' ? null : 'prompt')}
                      className="cursor-pointer flex items-center gap-1 text-[9px] font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-md transition-colors"
                    >
                      <Plus size={10} /> Insert Data
                    </motion.button>

                    <AnimatePresence>
                      {pickerTarget === 'prompt' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                          animate={{ opacity: 1, y: 0, scale: 1 }} 
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-[#141414]/90 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                        >
                          <div className="px-3 py-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-black/40 border-b border-white/5">
                            Available Variables
                          </div>
                          <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                            {availableVars.length === 0 ? (
                              <div className="px-3 py-5 text-[10px] text-gray-500 text-center italic">Add upstream nodes to see data</div>
                            ) : (
                              availableVars.map((v, idx) => (
                                <motion.button 
                                  key={idx}
                                  whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}
                                  onClick={() => insertVariable(v.path)}
                                  className="cursor-pointer w-full text-left px-3 py-2.5 text-[11px] text-gray-300 hover:text-indigo-300 transition-colors border-b border-white/5 flex items-center gap-2"
                                >
                                  <span className="opacity-70">{v.icon}</span>
                                  <span className="truncate font-mono">{v.label}</span>
                                </motion.button>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <textarea 
                  className="w-full h-40 bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none resize-none placeholder-gray-600 font-mono transition-all shadow-inner leading-relaxed"
                  placeholder="You are a helpful AI assistant... Use {{variables}} to inject data."
                  {...inputProps('prompt')}
                />
              </div>
            </motion.div>
          )}

          {actionType === 'slack_message' && (
            <motion.div 
              key="slack"
              initial={{ opacity: 0, y: 15, scale: 0.98 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="space-y-5"
            >
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  <MessageSquare size={12} className="text-pink-400" /> Webhook URL
                </label>
                <input
                  type="text"
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 focus:outline-none transition-all shadow-inner font-mono"
                  {...inputProps('webhookUrl')}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message Body</label>
                  
                  <div className="relative">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPickerTarget(pickerTarget === 'message' ? null : 'message')}
                      className="cursor-pointer flex items-center gap-1 text-[9px] font-semibold bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 px-2 py-1 rounded-md transition-colors"
                    >
                      <Plus size={10} /> Insert Data
                    </motion.button>

                    <AnimatePresence>
                      {pickerTarget === 'message' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                          animate={{ opacity: 1, y: 0, scale: 1 }} 
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-[#141414]/90 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                        >
                          <div className="px-3 py-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-black/40 border-b border-white/5">
                            Available Variables
                          </div>
                          <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                            {availableVars.length === 0 ? (
                              <div className="px-3 py-5 text-[10px] text-gray-500 text-center italic">Add upstream nodes to see data</div>
                            ) : (
                              availableVars.map((v, idx) => (
                                <motion.button 
                                  key={idx}
                                  whileHover={{ backgroundColor: "rgba(236, 72, 153, 0.1)" }}
                                  onClick={() => insertVariable(v.path)}
                                  className="cursor-pointer w-full text-left px-3 py-2.5 text-[11px] text-gray-300 hover:text-pink-300 transition-colors border-b border-white/5 flex items-center gap-2"
                                >
                                  <span className="opacity-70">{v.icon}</span>
                                  <span className="truncate font-mono">{v.label}</span>
                                </motion.button>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <textarea 
                  className="w-full h-32 bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 focus:outline-none resize-none placeholder-gray-600 font-mono transition-all shadow-inner leading-relaxed"
                  placeholder="New Alert: {{trigger.body.message}}"
                  {...inputProps('message')}
                />
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {selectedNode.type === 'ACTION' && actionType !== '' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, type: "spring" }}
            className="mt-8 pt-6 border-t border-white/5 space-y-4"
          >
            <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <Code2 size={12} /> Execution Policy
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] text-gray-500 font-semibold mb-1.5 uppercase tracking-wider">Max Retries</label>
                <input 
                  type="number" min="0" max="10"
                  className="w-full bg-black/40 border border-white/5 hover:border-white/10 rounded-lg px-2.5 py-2 text-xs text-gray-300 focus:border-blue-500/50 focus:outline-none transition-all shadow-inner text-center font-mono"
                  {...inputProps('maxRetries', true)}
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-500 font-semibold mb-1.5 uppercase tracking-wider">Delay (ms)</label>
                <input 
                  type="number" min="1000" step="1000"
                  className="w-full bg-black/40 border border-white/5 hover:border-white/10 rounded-lg px-2.5 py-2 text-xs text-gray-300 focus:border-blue-500/50 focus:outline-none transition-all shadow-inner text-center font-mono"
                  {...inputProps('retryDelayMs', true)}
                />
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
};