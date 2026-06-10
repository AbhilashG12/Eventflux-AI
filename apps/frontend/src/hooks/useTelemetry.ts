import { useEffect } from 'react';
import { useWorkflowStore, type NodeStatus } from '../core/store/workflow.store';
import { useShallow } from "zustand/react/shallow";
import { socketClient } from '../core/websocket/socket.client'; 

export const useTelemetry = (token: string | null) => {
  const { updateNodeStatus } = useWorkflowStore(
    useShallow((state) => ({
      updateNodeStatus: state.updateNodeStatus,
    }))
  );

  useEffect(() => {
    if (!token) {
      console.error('🔴 [Telemetry] ABORTED: No token provided to the hook!');
      return;
    }

    // 1. Define the stable callback function so we can reference it during cleanup
    const handleTelemetryUpdate = (payload: any) => {
      console.log('🔥 [Telemetry] GOT PAYLOAD FROM BACKEND:', payload); 
      
      const { nodeId, status } = payload;
      if (!nodeId || !status) return;

      const normalizedStatus = status.toUpperCase() as NodeStatus;
      
      if (['RUNNING', 'COMPLETED', 'FAILED'].includes(normalizedStatus)) {
        updateNodeStatus(nodeId, normalizedStatus);

        if (normalizedStatus === 'COMPLETED' || normalizedStatus === 'FAILED') {
          setTimeout(() => {
            updateNodeStatus(nodeId, 'IDLE');
          }, 4000);
        }
      }
    };

    // 2. Safely subscribe using the Singleton Manager
    // (The manager automatically checks if it needs to connect first)
    socketClient.subscribe('workflow-node-update', handleTelemetryUpdate);

    // 3. Bulletproof Cleanup
    return () => {
      // 🚀 THE FIX: We pass the exact callback reference, and we DO NOT disconnect the socket here.
      // This ensures other components using WebSockets stay connected!
      socketClient.unsubscribe('workflow-node-update', handleTelemetryUpdate);
    };
  }, [token, updateNodeStatus]);
};