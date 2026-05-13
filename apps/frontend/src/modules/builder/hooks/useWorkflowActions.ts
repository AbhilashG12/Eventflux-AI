import { useState, useEffect } from 'react';
import { apiClient } from '../../../core/api/client';
import { useWorkflowStore } from '../../../core/store/workflow.store';
import { useErrorStore } from '../../../core/store/error.store';
import { useSuccessStore } from '../../../core/store/success.store';

export const useWorkflowActions = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { nodes, edges, workflowId, setWorkflowId, setNodes, setEdges } = useWorkflowStore();
  
  const showError = useErrorStore((state) => state.showError);
  const showSuccess = useSuccessStore((state) => state.showSuccess);

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const { data } = await apiClient.get('/workflows');
        if (data && data.length > 0) {
          const wf = data[0]; 
          setWorkflowId(wf.id);
          if (wf.definition?.nodes) setNodes(wf.definition.nodes);
          if (wf.definition?.edges) setEdges(wf.definition.edges);
        }
      } catch (error) {
        console.error("Failed to load workflows");
      }
    };
    loadWorkflow();
  }, [setNodes, setEdges, setWorkflowId]);

  const onSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: "My Canvas Workflow",
        definition: {
          nodes: nodes.map(n => ({ id: n.id, type: n.type, data: n.data, position: n.position })),
          edges: edges.map(e => ({ source: e.source, target: e.target }))
        }
      };

      if (workflowId) {
        await apiClient.put(`/workflows/${workflowId}`, payload);
        showSuccess("Workflow updated successfully!");
      } else {
        const { data } = await apiClient.post('/workflows', payload);
        const newId = data.id || data.workflowId || data.workflow?.id; 
        
        if (newId) {
          setWorkflowId(newId);
          showSuccess("Workflow published successfully!");
        } else {
          console.error("Backend response missing ID:", data);
          showError("Workflow saved, but backend didn't return an ID.");
        }
      }
    } catch (error: any) {
      showError(`Failed to save: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const onTestRun = async () => {
    if (!workflowId) {
      showError("Please publish the workflow before testing!");
      return;
    }
    try {
      await apiClient.post(`/workflows/${workflowId}/execute`, {
        payload: { source: "manual_frontend_test" }
      });
      showSuccess("Execution Queued! Switch to Telemetry.");
    } catch (error: any) {
      showError(`Execution failed: ${error.response?.data?.error || error.message}`);
    }
  };

  return { isSaving, onSave, onTestRun };
};