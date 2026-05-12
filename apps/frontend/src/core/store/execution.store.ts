import { create } from 'zustand';

export type NodeStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

interface ExecutionLog {
  timestamp: string;
  nodeId: string;
  message: string;
}

interface ExecutionState {
  nodeStatuses: Record<string, NodeStatus>;
  logs: ExecutionLog[];
  updateNodeStatus: (nodeId: string, status: NodeStatus, message?: string) => void;
  clearExecution: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  nodeStatuses: {},
  logs: [],
  
  updateNodeStatus: (nodeId, status, message) => set((state) => ({
    nodeStatuses: { ...state.nodeStatuses, [nodeId]: status },
    logs: message ? [...state.logs, {
      timestamp: new Date().toISOString(),
      nodeId,
      message
    }] : state.logs
  })),

  clearExecution: () => set({ nodeStatuses: {}, logs: [] })
}));