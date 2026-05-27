import { useWorkflowStore } from '../../../core/store/workflow.store';

export const ConfigPanel = () => {
  const { selectedNodeId, nodes, updateNodeData } = useWorkflowStore();
  
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
      config: { ...config, [key]: value }
    });
  };

  const handleActionTypeChange = (newType: string) => {
    updateNodeData(selectedNode.id, {
      actionType: newType,
      label: newType === 'webhook_trigger' ? 'Webhook Trigger' : 
             newType === 'cron_trigger' ? 'Cron Schedule' : 
             newType === 'manual_trigger' ? 'Manual Trigger' : label
    });
  };

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
                <option value="http_request">HTTP Request</option>
              </optgroup>
            )}
          </select>
        </div>
        
        {actionType === 'webhook_trigger' && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex flex-col gap-2">
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Webhook URL</span>
            <div className="bg-black/50 p-2 rounded border border-emerald-500/20 overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-900">
              <code className="text-[11px] text-emerald-300 whitespace-nowrap select-all font-mono">
                https://api.yourdomain.com/webhooks/{selectedNode.id}
              </code>
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
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">System Prompt</label>
              <textarea 
                value={config.prompt || ''}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                className="w-full h-40 bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none resize-none placeholder-gray-600 font-mono"
                placeholder="You are a helpful AI assistant..."
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};