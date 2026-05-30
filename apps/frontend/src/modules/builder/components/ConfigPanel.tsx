import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkflowStore } from '../../../core/store/workflow.store';

export const ConfigPanel = () => {
  const { workflowId } = useParams(); 
  
  const { selectedNodeId, nodes, updateNodeData } = useWorkflowStore();
  const [pickerTarget, setPickerTarget] = useState<string | null>(null);
  const [activeInput, setActiveInput] = useState<{ field: string, cursorIndex: number } | null>(null);
  
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="w-80 bg-[#141414] border-l border-white/5 p-6 flex items-center justify-center text-gray-500 text-sm">
        Select a node to configure.
      </div>
    );
  }

  const { actionType = '', config = {}, label = 'Action Node' } = selectedNode.data || {};

  const handleConfigChange = (key: string, value: any) => {
    updateNodeData(selectedNode.id, {
      ...selectedNode.data,
      config: { 
        ...config, 
        [key]: value 
      }
    });
  };

  const handleActionTypeChange = (newType: string) => {
    updateNodeData(selectedNode.id, {
      ...selectedNode.data,
      actionType: newType,
      label: newType === 'webhook_trigger' ? 'Webhook Trigger' : 
             newType === 'cron_trigger' ? 'Cron Schedule' : 
             newType === 'manual_trigger' ? 'Manual Trigger' : 
             newType === 'slack_message' ? 'Slack Output' : label
    });
  };

  const insertVariable = (variablePath: string) => {
    if (!pickerTarget) return;
    
    const currentVal = config[pickerTarget] || '';
    
    if (activeInput && activeInput.field === pickerTarget) {
      const insertion = `{{${variablePath}}}`;
      const newVal = currentVal.slice(0, activeInput.cursorIndex) + insertion + currentVal.slice(activeInput.cursorIndex);
      handleConfigChange(pickerTarget, newVal);
    } else {
      const needsSpace = currentVal.length > 0 && !currentVal.endsWith(' ') && !currentVal.endsWith('\n');
      handleConfigChange(pickerTarget, currentVal + (needsSpace ? ' ' : '') + `{{${variablePath}}}`);
    }
    
    setPickerTarget(null);
  };

  const getAvailableVariables = () => {
    const vars: { path: string, label: string, icon: string }[] = [];
    
    nodes.forEach(n => {

      if (n.id === selectedNode.id) return; 

      if (n.type === 'TRIGGER') {
        vars.push({ path: 'trigger.body', label: 'Trigger: Full Data', icon: '⚡' });
        if (n.data?.actionType === 'webhook_trigger') {
          vars.push({ path: 'trigger.body.email', label: 'Webhook: Email', icon: '📧' });
          vars.push({ path: 'trigger.body.name', label: 'Webhook: Name', icon: '👤' });
        }
      }
      
      if (n.type === 'ACTION') {
        if (n.data?.actionType === 'ai_generate') {
          vars.push({ path: 'groq.reply', label: 'AI: Generated Output', icon: '🧠' });
        }
        if (n.data?.actionType === 'http_request') {
          vars.push({ path: `${n.id}.data`, label: 'API: Response Data', icon: '🌐' });
        }
      }
    });

    return vars;
  };

  const availableVars = getAvailableVariables();

  return (
    <div className="w-80 bg-[#0a0a0a] border-l border-white/10 flex flex-col shadow-2xl relative z-20">
      <div className="px-5 py-4 border-b border-white/10 bg-[#141414]">
        <h3 className="text-lg font-semibold text-white tracking-tight">{label}</h3>
        <p className="text-xs text-gray-400 mt-1 font-mono">ID: {selectedNode.id}</p>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
        
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {selectedNode.type === 'TRIGGER' ? 'Trigger Type' : 'Action Type'}
          </label>
          <select 
            value={actionType} 
            onChange={(e) => handleActionTypeChange(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="" disabled>Select a type...</option>
            {selectedNode.type === 'TRIGGER' && (
              <optgroup label="⚡ Triggers (Start Workflow)">
                <option value="webhook_trigger">Webhook URL</option>
                <option value="cron_trigger">Cron Schedule</option>
                <option value="manual_trigger">Manual / API Trigger</option>
              </optgroup>
            )}
            {selectedNode.type === 'ACTION' && (
              <optgroup label="⚙️ Actions (Process Data)">
                <option value="ai_generate">Llama 3.1 (8B Fast)</option>
                <option value="slack_message">Send Slack Message</option>
                <option value="http_request">HTTP Request</option>
                <option value="email_send">Send Email</option>
              </optgroup>
            )}
          </select>
        </div>
        
        {actionType === 'webhook_trigger' && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex flex-col gap-2 animate-in fade-in">
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Webhook URL</span>
            
            <div className="bg-black/50 p-2 rounded border border-emerald-500/20 flex items-center justify-between gap-2">
              <code className="text-[11px] text-emerald-300 overflow-hidden text-ellipsis font-mono">
                https://YOUR_NGROK_URL/api/webhooks/{workflowId || 'save-to-generate'}
              </code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`https://YOUR_NGROK_URL/api/webhooks/${workflowId}`);
                  alert("Copied to clipboard!");
                }}
                className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 px-2 py-1 rounded transition-colors whitespace-nowrap"
              >
                Copy
              </button>
            </div>
            
            <p className="text-[10px] text-emerald-500/70 mt-1">Send a POST request to this URL to trigger the workflow.</p>
          </div>
        )}

        {actionType === 'cron_trigger' && (
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg flex flex-col gap-2">
            <label className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Cron Schedule</label>
            <input 
              type="text"
              value={config.cronString || '0 * * * *'}
              onChange={(e) => handleConfigChange('cronString', e.target.value)}
              placeholder="*/5 * * * *"
              className="w-full bg-black/50 border border-purple-500/20 rounded-lg px-3 py-2 text-sm text-purple-200 font-mono focus:border-purple-500 focus:outline-none"
            />
            <p className="text-[10px] text-purple-400/70">Example: <code>0 * * * *</code> runs every hour.</p>
          </div>
        )}

        {actionType === 'manual_trigger' && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-2">Manual Execution</h4>
            <p className="text-[11px] text-blue-300/80 leading-relaxed">
              This workflow is waiting in standby. It will only run when you click the <strong>Test Run</strong> button or trigger it programmatically via your backend logic.
            </p>
          </div>
        )}

        {actionType === 'ai_generate' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System Prompt</label>
                
                <div className="relative">
                  <button 
                    onClick={() => setPickerTarget(pickerTarget === 'prompt' ? null : 'prompt')}
                    className="text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded transition-colors"
                  >
                    + Insert Data `{ }`
                  </button>

                  {pickerTarget === 'prompt' && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                      <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase bg-black/40 border-b border-white/5">
                        Available Variables
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        <button 
                          onClick={() => insertVariable('trigger.body.message')}
                          className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors border-b border-white/5"
                        >
                          ⚡ Webhook: Message Field
                        </button>
                        <button 
                          onClick={() => insertVariable('trigger.body')}
                          className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors border-b border-white/5"
                        >
                          ⚡ Webhook: Full Body
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 👈 Added onSelect to track cursor position */}
              <textarea 
                value={config.prompt || ''}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                onSelect={(e) => setActiveInput({ field: 'prompt', cursorIndex: e.currentTarget.selectionStart })}
                className="w-full h-40 bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none resize-none placeholder-gray-600 font-mono"
                placeholder="You are a helpful AI assistant..."
              />
            </div>
          </div>
        )}

        {actionType === 'slack_message' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Slack Webhook URL
              </label>
              <input
                type="text"
                placeholder="https://hooks.slack.com/services/..."
                value={config.webhookUrl || ''}
                onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Message Body</label>
                
                <div className="relative">
                  <button 
                    onClick={() => setPickerTarget(pickerTarget === 'message' ? null : 'message')}
                    className="text-[10px] bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 px-2 py-1 rounded transition-colors"
                  >
                    + Insert Data `{ }`
                  </button>

                  {pickerTarget === 'message' && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                      <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase bg-black/40 border-b border-white/5">
                        Available Variables
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        <button 
                          onClick={() => insertVariable('groq.reply')}
                          className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-pink-500/20 hover:text-pink-300 transition-colors border-b border-white/5"
                        >
                          🧠 AI: Generated Output
                        </button>
                        <button 
                          onClick={() => insertVariable('trigger.body.message')}
                          className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-pink-500/20 hover:text-pink-300 transition-colors border-b border-white/5"
                        >
                          ⚡ Webhook: Message Field
                        </button>
                        <button 
                          onClick={() => insertVariable('trigger.body')}
                          className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-pink-500/20 hover:text-pink-300 transition-colors border-b border-white/5"
                        >
                          ⚡ Webhook: Full Body
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 👈 Added onSelect to track cursor position */}
              <textarea 
                value={config.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                onSelect={(e) => setActiveInput({ field: 'message', cursorIndex: e.currentTarget.selectionStart })}
                className="w-full h-32 bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none resize-none placeholder-gray-600 font-mono"
                placeholder="New Feedback Sentiment: {{groq.reply}}"
              />
            </div>
          </div>
        )}

        {selectedNode.type === 'ACTION' && actionType !== '' && (
          <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Retry Policy</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Max Retries</label>
                <input 
                  type="number"
                  min="0"
                  max="10"
                  value={config.maxRetries || 0}
                  onChange={(e) => handleConfigChange('maxRetries', parseInt(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Delay (ms)</label>
                <input 
                  type="number"
                  min="1000"
                  step="1000"
                  value={config.retryDelayMs || 2000}
                  onChange={(e) => handleConfigChange('retryDelayMs', parseInt(e.target.value) || 2000)}
                  className="w-full bg-[#141414] border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {actionType === 'email_send' && (
          <div className="space-y-4 mt-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                To Email
              </label>
              <input
                type="text"
                placeholder="{{trigger.body.email}} or test@example.com"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded p-2 text-sm text-gray-200 focus:border-orange-500 outline-none"
                value={config.to || ''}
                onChange={(e) => handleConfigChange('to', e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="Welcome to the platform!"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded p-2 text-sm text-gray-200 focus:border-orange-500 outline-none"
                value={config.subject || ''}
                onChange={(e) => handleConfigChange('subject', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Body Message
              </label>
              <textarea
                placeholder="Write your email here... Use {{variables}} to inject data."
                className="w-full bg-[#0a0a0a] border border-white/10 rounded p-2 text-sm text-gray-200 focus:border-orange-500 outline-none h-32 resize-none"
                value={config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};