import { useWorkflowStore } from '../../../core/store/workflow.store';

export const ConfigPanel = () => {
  const { nodes, selectedNodeId, updateNodeData } = useWorkflowStore();
  
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="w-80 bg-surface border-l border-border h-full p-6 flex flex-col items-center justify-center text-center shadow-xl z-10">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
          <span className="text-gray-500">⚙️</span>
        </div>
        <h3 className="text-sm font-medium text-gray-300">No Node Selected</h3>
        <p className="text-xs text-gray-500 mt-2">Click a node on the canvas to configure its properties.</p>
      </div>
    );
  }

  const { actionType, config = {} } = selectedNode.data;

  const handleConfigChange = (key: string, value: any) => {
    updateNodeData(selectedNode.id, {
      config: { ...config, [key]: value }
    });
  };

  return (
    <div className="w-80 bg-black/20 backdrop-blur-xl border-l border-white/8 h-full flex flex-col z-10">
      <div className="p-4 border-b border-border bg-[#0a0a0a]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">{selectedNode.id}</span>
        </div>
        <h3 className="text-lg font-semibold text-white tracking-tight">{selectedNode.data.label}</h3>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        
        {actionType === 'ai_generate' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">AI Model</label>
              <select 
                value={config.model || 'llama3-8b-8192'}
                onChange={(e) => handleConfigChange('model', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="llama3-8b-8192">Llama 3 (8B)</option>
                <option value="llama3-70b-8192">Llama 3 (70B)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">System Prompt</label>
              <textarea 
                value={config.prompt || ''}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                rows={6}
                placeholder="You are an expert data extractor. Extract the user's intent..."
                className="w-full bg-[#0a0a0a] border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none resize-none font-mono"
              />
            </div>
          </div>
        )}

        {actionType === 'http_request' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Method</label>
              <select 
                value={config.method || 'POST'}
                onChange={(e) => handleConfigChange('method', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Endpoint URL</label>
              <input 
                type="url"
                value={config.url || ''}
                onChange={(e) => handleConfigChange('url', e.target.value)}
                placeholder="https://api.example.com/v1/data"
                className="w-full bg-[#0a0a0a] border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        )}

        {actionType === 'webhook_trigger' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-xs text-emerald-400 font-medium">
                This workflow will execute whenever a POST request is sent to your Tenant Webhook URL.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};