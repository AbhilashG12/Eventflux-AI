import { copyText } from '../../../../core/utils/clipboard';
import { useErrorStore } from '../../../../core/store/error.store';
import { useSuccessStore } from '../../../../core/store/success.store';

export const ConfigHeader = ({ label, nodeId, workflowId }: { label: string, nodeId: string, workflowId?: string }) => {
  const showError = useErrorStore((state: any) => state.showError); 
  const showSuccess = useSuccessStore((state: any) => state.showSuccess);

  const handleCopy = async (text: string | undefined, type: string) => {
    if (!text) {
      showError("Please save the workflow first to generate an ID.");
      return;
    }

    const success = await copyText(text);
    
    if (success) {
      showSuccess(`${type} copied to clipboard!`);
    } else {
      showError("Browser blocked clipboard access. Please select and copy manually.");
    }
  };

  return (
    <div className="px-5 py-4 border-b border-white/10 bg-[#141414]">
      <h3 className="text-lg font-semibold text-white tracking-tight">{label}</h3>
      
      <div className="flex flex-col gap-1 mt-3">
        {/* Workflow ID */}
        <div className="flex items-center justify-between group bg-indigo-500/5 rounded px-2 py-1 border border-indigo-500/10">
          <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Flow ID</span>
          <code className="text-[10px] text-indigo-300 font-mono truncate max-w-30">
            {workflowId || 'Unsaved'}
          </code>
          <button 
            onClick={() => handleCopy(workflowId, "Workflow ID")}
            className="text-[9px] bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy Workflow ID"
          >
            Copy
          </button>
        </div>

        {/* Node ID */}
        <div className="flex items-center justify-between group hover:bg-white/5 rounded px-2 py-1 transition-colors">
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Node ID</span>
          <code className="text-[10px] text-gray-500 font-mono truncate max-w-30">{nodeId}</code>
          <button 
            onClick={() => handleCopy(nodeId, "Node ID")}
            className="text-[9px] bg-white/10 hover:bg-white/20 text-gray-400 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy Node ID"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};