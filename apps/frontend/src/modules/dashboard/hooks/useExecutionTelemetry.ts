import { useEffect, useState } from 'react';
import { apiClient } from '../../../core/api/client';
import { useSocketStore } from '../../../core/store/socket.store';

export interface Execution {
  id: string;
  status: string;
  startedAt: string;
  completedAt?: string;
}

export interface ExecutionLog {
  id: string;
  nodeId: string;
  status: string;
  message: string;
  timestamp: string;
}

export const useExecutionTelemetry = (workflowId: string) => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  
  const lastMessage = useSocketStore(state => state.lastMessage);

  // Fetch History
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await apiClient.get(`/executions/workflow/${workflowId}`);
        setExecutions(data);
        if (data.length > 0) setSelectedExecutionId(data[0].id);
      } catch (err) {
        console.error("Failed to fetch history");
      }
    };
    if (workflowId) fetchHistory();
  }, [workflowId]);

  // Fetch Logs for selected execution
  useEffect(() => {
    if (!selectedExecutionId) return;
    const fetchLogs = async () => {
      const { data } = await apiClient.get(`/executions/${selectedExecutionId}/logs`);
      setLogs(data);
    };
    fetchLogs();
  }, [selectedExecutionId]);

  // WebSocket Live Stream
  useEffect(() => {
    if (lastMessage && selectedExecutionId) {
      const { nodeId, status, timestamp } = lastMessage;
      
      const newLog: ExecutionLog = {
        id: Math.random().toString(),
        nodeId,
        status: status.toUpperCase(),
        message: `Step [${nodeId}] marked as ${status.toUpperCase()}`,
        timestamp: timestamp || new Date().toISOString()
      };
      
      setLogs(prev => [...prev, newLog]);
      
      if (status === 'completed') {
        setExecutions(prev => prev.map(ex => 
          ex.id === selectedExecutionId ? { ...ex, status: 'COMPLETED' } : ex
        ));
      }
    }
  }, [lastMessage, selectedExecutionId]);

  return {
    executions,
    selectedExecutionId,
    setSelectedExecutionId,
    logs,
    activeStatus: executions.find(e => e.id === selectedExecutionId)?.status
  };
};