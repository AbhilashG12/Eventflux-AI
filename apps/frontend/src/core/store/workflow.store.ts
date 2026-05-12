import { create } from 'zustand';
import { 
  type Connection, 
  type Edge, 
  type Node, 
  addEdge, 
  type OnNodesChange, 
  type OnEdgesChange, 
  applyNodeChanges, 
  applyEdgeChanges 
} from 'reactflow';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: (nodeId: string, data: any) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes) => set({
    nodes: applyNodeChanges(changes, get().nodes),
  }),
  onEdgesChange: (changes) => set({
    edges: applyEdgeChanges(changes, get().edges),
  }),
  onConnect: (connection) => set({
    edges: addEdge(connection, get().edges),
  }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  updateNodeData: (nodeId, data) => set({
    nodes: get().nodes.map((node) => 
      node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
    ),
  }),
}));