import { useState, useEffect } from 'react';
import { apiClient } from '../../../core/api/client';
import { useWorkflowStore } from '../../../core/store/workflow.store';
import { useErrorStore } from '../../../core/store/error.store';

export const useWorkflowActions = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { nodes, edges, workflowId, setWorkflowId, setNodes, setEdges } = useWorkflowStore();
  const showError = useErrorStore((state) => state.showError);

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
      } else {
        const { data } = await apiClient.post('/workflows', payload);
        setWorkflowId(data.id);
      }
    } catch (error: any) {
      // Trigger the global error card!
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
      // Optionally, you could make a useSuccessStore for success messages, 
      // but for now we just log it or handle UI state elsewhere.
    } catch (error: any) {
      // Trigger the global error card!
      showError(`Execution failed: ${error.response?.data?.error || error.message}`);
    }
  };

  return { isSaving, onSave, onTestRun };
};