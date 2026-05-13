import React from 'react';

export const NodePalette = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, actionType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType, actionType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-black/20 backdrop-blur-xl border-r border-white/8 h-full flex flex-col z-10">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Node Palette</h3>
        <p className="text-xs text-gray-500 mt-1">Drag elements to the canvas</p>
      </div>

      <div className="p-4 space-y-4">
        
        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Triggers</h4>
          <div 
            className="bg-[#0a0a0a] border border-white/10 rounded-lg p-3 cursor-grab hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all flex items-center gap-3 shadow-lg"
            onDragStart={(e) => onDragStart(e, 'TRIGGER', 'webhook_trigger', 'Webhook Trigger')}
            draggable
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-sm text-gray-200 font-medium">Webhook Event</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Actions</h4>
          
          <div 
            className="bg-[#0a0a0a] border border-white/10 rounded-lg p-3 mb-2 cursor-grab hover:border-purple-500/50 hover:bg-purple-500/10 transition-all flex items-center gap-3 shadow-lg"
            // 🔥 Changed 'action' to 'ACTION'
            onDragStart={(e) => onDragStart(e, 'ACTION', 'ai_generate', 'AI Generation')}
            draggable
          >
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            <span className="text-sm text-gray-200 font-medium">Llama 3 AI Task</span>
          </div>

          <div 
            className="bg-[#0a0a0a] border border-white/10 rounded-lg p-3 cursor-grab hover:border-blue-500/50 hover:bg-blue-500/10 transition-all flex items-center gap-3 shadow-lg"
            // 🔥 Changed 'action' to 'ACTION'
            onDragStart={(e) => onDragStart(e, 'ACTION', 'http_request', 'HTTP Request')}
            draggable
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-sm text-gray-200 font-medium">External API Call</span>
          </div>
        </div>

      </div>
    </div>
  );
};