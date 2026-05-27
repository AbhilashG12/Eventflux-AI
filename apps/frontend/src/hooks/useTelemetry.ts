import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWorkflowStore, type NodeStatus } from '../core/store/workflow.store';

export const useTelemetry = (token: string | null) => {
  const { updateNodeStatus } = useWorkflowStore();
  const socketRef = useRef<Socket | null>(null);

 useEffect(() => {
    if (!token) {
      console.error('🔴 [Telemetry] ABORTED: No token provided to the hook!');
      return;
    }

    console.log('🟡 [Telemetry] Connecting with token:', token.substring(0, 15) + '...');

    const socket = io('http://localhost:3001', {
      auth: { token },
      extraHeaders: { Authorization: `Bearer ${token}` }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🟢 [Telemetry] Socket.io connected to engine!');
    });

    socket.on('connect_error', (err) => {
      console.error('🔴 [Telemetry] Connection error:', err.message);
    });

    socket.on('workflow-node-update', (payload) => {
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
    });

    return () => {
      socket.disconnect();
    };
  }, [token, updateNodeStatus]);
};