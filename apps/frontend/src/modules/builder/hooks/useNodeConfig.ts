import { useState } from 'react';
import { useWorkflowStore } from '../../../core/store/workflow.store';

export const useNodeConfig = (selectedNodeId: string | null) => {
  const { nodes } = useWorkflowStore();
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  
  const [pickerTarget, setPickerTarget] = useState<string | null>(null);
  const [activeInput, setActiveInput] = useState<{ field: string, cursorIndex: number } | null>(null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const { actionType = '', config = {}, label = 'Action Node' } = selectedNode?.data || {};

  const handleConfigChange = (key: string, value: any) => {
    if (!selectedNode) return;
    updateNodeData(selectedNode.id, {
      ...selectedNode.data,
      config: { ...config, [key]: value }
    });
  };

  const handleActionTypeChange = (newType: string) => {
    if (!selectedNode) return;
    updateNodeData(selectedNode.id, {
      ...selectedNode.data,
      actionType: newType,
      label: newType === 'webhook_trigger' ? 'Webhook Trigger' : 
             newType === 'cron_trigger' ? 'Cron Schedule' : 
             newType === 'manual_trigger' ? 'Manual Trigger' : 
             newType === 'slack_message' ? 'Slack Output' : 
             newType === 'email_send' ? 'Send Email' : selectedNode.data.label
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
    if (!selectedNode) return vars;

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
        if (n.data?.actionType === 'ai_generate') vars.push({ path: 'groq.reply', label: 'AI: Generated Output', icon: '🧠' });
        if (n.data?.actionType === 'http_request') vars.push({ path: `${n.id}.data`, label: 'API: Response Data', icon: '🌐' });
      }
    });
    return vars;
  };

  return {
    selectedNode, actionType, config, label,
    pickerTarget, setPickerTarget,
    setActiveInput, handleConfigChange, handleActionTypeChange, insertVariable,
    availableVars: getAvailableVariables()
  };
};