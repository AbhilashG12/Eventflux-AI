import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../core/api/client';
import { useWorkflowStore } from '../../../core/store/workflow.store';
import { useErrorStore } from '../../../core/store/error.store';
import { useSuccessStore } from '../../../core/store/success.store';

export const useWorkflowActions = () => {
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

    const payload = {
      name: workflowName,
      definition: {
        nodes: freshNodes.map(n => ({ id: n.id, type: n.type, data: n.data, position: n.position })),
        edges: freshEdges.map(e => ({ source: e.source, target: e.target }))
      }
    };

    try {
      // Step 1: Optimistically attempt a PATCH
      if (currentWorkflowId) {
        try {
          await apiClient.patch(`/workflows/${currentWorkflowId}/draft`, payload);
          showSuccess("Draft saved successfully!");
          setWorkflowStatus('DRAFT');
          setIsSaving(false);
          return; // Exit early if PATCH succeeds
        } catch (patchError: any) {
          if (patchError.response?.status !== 404) {
             throw patchError; 
          }
        }
      }
      
      // Step 2: POST to create a new workflow if PATCH fails or there's no current ID
      const { data } = await apiClient.post('/workflows', payload);
      const newId = data.id || data.workflowId || data.workflow?.id; 
      
      if (newId) {
        setWorkflowId(newId);
        showSuccess("New workflow created and saved!");
        
        // 🚀 THE FIX: Sync the URL with the newly created ID so subsequent saves PATCH instead of POST
        // Update '/builder/' to whatever your actual URL path is for the workflow canvas
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
      showSuccess("Execution Queued! Switch to Telemetry.");
    } catch (error: any) {
      showError(`Execution failed: ${error.response?.data?.error || error.message}`);
    }
  };

  return { isSaving, isPublishing, workflowStatus, onSave, onPublish, onTestRun };
};