import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../core/api/client';
import { useWorkflowStore } from '../../../core/store/workflow.store';
import { useErrorStore } from '../../../core/store/error.store';
import { useSuccessStore } from '../../../core/store/success.store';

export const useWorkflowActions = (onOpenLogs?: () => void) => {
  const navigate = useNavigate(); 
  const { id: urlWorkflowId } = useParams();

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  
  const { setWorkflowId, setNodes, setEdges } = useWorkflowStore();
  const showError = useErrorStore((state) => state.showError);
  const showSuccess = useSuccessStore((state) => state.showSuccess);

  useEffect(() => {
    const loadWorkflow = async () => {
      if (!urlWorkflowId) return; 

      try {
        const { data } = await apiClient.get('/workflows');
        const targetWorkflow = data.find((w: any) => w.id === urlWorkflowId);

        if (targetWorkflow) {
          setWorkflowId(targetWorkflow.id);
          if (targetWorkflow.status) setWorkflowStatus(targetWorkflow.status);
          if (targetWorkflow.definition?.nodes) setNodes(targetWorkflow.definition.nodes);
          if (targetWorkflow.definition?.edges) setEdges(targetWorkflow.definition.edges); 
        }
      } catch (error) {
        console.error("Failed to load workflow");
      }
    };
    loadWorkflow();
  }, [urlWorkflowId, setNodes, setEdges, setWorkflowId]);

  const onSave = async () => {
    setIsSaving(true);
    
    const freshState = useWorkflowStore.getState();
    const freshNodes = freshState.nodes;
    const freshEdges = freshState.edges;
    const currentWorkflowId = freshState.workflowId;
    const workflowName = freshState.name || "Untitled Workflow";

    // 🚀 THE FIX: Pass edges directly to preserve IDs, types, and connection handles.
    const payload = {
      name: workflowName,
      definition: {
        nodes: freshNodes.map(n => ({ id: n.id, type: n.type, data: n.data, position: n.position })),
        edges: freshEdges 
      }
    };

    try {
      if (currentWorkflowId) {
        try {
          await apiClient.patch(`/workflows/${currentWorkflowId}/draft`, payload);
          showSuccess("Draft saved successfully!");
          setWorkflowStatus('DRAFT');
          setIsSaving(false);
          return; 
        } catch (patchError: any) {
          if (patchError.response?.status !== 404) {
             throw patchError; 
          }
        }
      }
      
      const { data } = await apiClient.post('/workflows', payload);
      const newId = data.id || data.workflowId || data.workflow?.id; 
      
      if (newId) {
        setWorkflowId(newId);
        showSuccess("New workflow created and saved!");
        navigate(`/builder/${newId}`, { replace: true });
      } else {
        showError("Workflow saved, but backend didn't return an ID.");
      }
      
      setWorkflowStatus('DRAFT');
      
    } catch (error: any) {
      showError(`Failed to save: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const onPublish = async () => {
    await onSave();
    
    const currentWorkflowId = useWorkflowStore.getState().workflowId;
    if (!currentWorkflowId) return; 

    setIsPublishing(true);
    try {
      await apiClient.post(`/workflows/${currentWorkflowId}/publish`);
      showSuccess("Workflow published successfully!");
      setWorkflowStatus('PUBLISHED');
    } catch (error: any) {
      showError(`Failed to publish: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const onTestRun = async () => {
    const currentWorkflowId = useWorkflowStore.getState().workflowId;
    
    if (!currentWorkflowId) {
      showError("Please save and publish the workflow before testing!");
      return;
    }
    
    try {
      await apiClient.post(`/workflows/${currentWorkflowId}/execute`, {
        payload: { source: "manual_frontend_test" }
      });
      showSuccess("Test execution started!");
      
      if (onOpenLogs) {
        onOpenLogs();
      }
    } catch (error: any) {
      showError(`Execution failed: ${error.response?.data?.error || error.message}`);
    }
  };

  return { isSaving, isPublishing, workflowStatus, onSave, onPublish, onTestRun };
};