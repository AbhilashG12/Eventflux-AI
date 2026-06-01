import { useEffect, useState, useCallback, useRef } from 'react';
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
  
  const processedLogsRef = useRef<Set<string>>(new Set());
  const fetchHistory = useCallback(async (isInitial = false) => {
    if (!workflowId) return;
    try {
      const { data } = await apiClient.get(`/executions/workflow/${workflowId}`);
      setExecutions(data);
      
      if (isInitial && data.length > 0) {
        setSelectedExecutionId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to sync execution history");
    }
  }, [workflowId]);

  useEffect(() => {
    fetchHistory(true);
    const interval = setInterval(() => fetchHistory(false), 30000); 
    return () => clearInterval(interval);
  }, [fetchHistory]);

  useEffect(() => {
    if (!selectedExecutionId) {
      setLogs([]);
      processedLogsRef.current.clear();
      return;
    }

    const fetchLogs = async () => {
      try {
        const { data } = await apiClient.get(`/executions/${selectedExecutionId}/logs`);
        setLogs(data);
        processedLogsRef.current = new Set(data.map((l: ExecutionLog) => l.id));
      } catch (err) {
        setLogs([]);
      }
    };

    fetchLogs();
  }, [selectedExecutionId]);

  useEffect(() => {
    if (!lastMessage) return;

    const payload = lastMessage as any;
    const { executionId: wsExecId, nodeId, status, timestamp, type } = payload;
    if (type === 'EXECUTION_STARTED' || type === 'EXECUTION_FINISHED') {
      fetchHistory();
      return;
    }
    if (wsExecId === selectedExecutionId && nodeId) {
      const logId = `${wsExecId}-${nodeId}-${status}`;
      
      if (!processedLogsRef.current.has(logId)) {
        const newLog: ExecutionLog = {
          id: logId,
          nodeId,
          status: status.toUpperCase(),
          message: `Step [${nodeId}] marked as ${status.toUpperCase()}`,
          timestamp: timestamp || new Date().toISOString()
        };

        setLogs(prev => [...prev, newLog]);
        processedLogsRef.current.add(logId);
      }
      if (['completed', 'failed'].includes(status.toLowerCase())) {
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