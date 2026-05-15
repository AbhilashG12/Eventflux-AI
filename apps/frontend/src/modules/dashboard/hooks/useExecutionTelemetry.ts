import { useEffect, useState, useCallback } from 'react';
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
  const fetchHistory = useCallback(async () => {
    if (!workflowId) return;
    try {
      const { data } = await apiClient.get(`/executions/workflow/${workflowId}`);
      setExecutions(data);
      setSelectedExecutionId(current => current || (data.length > 0 ? data[0].id : null));
    } catch (err) {
      console.error("Failed to fetch history");
    }
  }, [workflowId]);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  useEffect(() => {
    if (!selectedExecutionId) return;
    const fetchLogs = async () => {
      const { data } = await apiClient.get(`/executions/${selectedExecutionId}/logs`);
      setLogs(data);
    };
    fetchLogs();
  }, [selectedExecutionId]);

  useEffect(() => {
    if (lastMessage && selectedExecutionId) {
      const { executionId: wsExecId, nodeId, status, timestamp } = lastMessage as any;
      if (wsExecId && wsExecId !== selectedExecutionId) return;

      const newLog: ExecutionLog = {
        id: Math.random().toString(),
        nodeId,
        status: status.toUpperCase(),
        message: `Step [${nodeId}] is ${status.toUpperCase()}`,
        timestamp: timestamp || new Date().toISOString()
      };
      
      setLogs(prev => [...prev, newLog]);

      if (status.toLowerCase() === 'completed' || status.toLowerCase() === 'failed') {
         fetchHistory(); 
      }
    }
  }, [lastMessage, selectedExecutionId, fetchHistory]);

  return {
    executions,
    selectedExecutionId,
    setSelectedExecutionId,
    logs,
    activeStatus: executions.find(e => e.id === selectedExecutionId)?.status
  };
};