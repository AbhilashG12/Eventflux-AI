import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
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

export type NodeStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';

interface WorkflowState {
  workflowId: string | null;
  name: string;
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  
  setWorkflowId: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  
  // Adjusted to support functional updates (React Flow needs this sometimes)
  setNodes: (nodes: Node[] | ((val: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((val: Edge[]) => Edge[])) => void;
  
  updateNodeData: (nodeId: string, data: any) => void;
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void;
  
  setName: (name: string) => void;
  createNewWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      workflowId: uuidv4(),
      name: 'Untitled Workflow',
      nodes: [],
      edges: [],
      selectedNodeId: null,
      
      setWorkflowId: (id) => set({ workflowId: id }),
      setSelectedNodeId: (id) => set({ selectedNodeId: id }),
      
      onNodesChange: (changes) => set({
        nodes: applyNodeChanges(changes, get().nodes),
      }),
      onEdgesChange: (changes) => set({
        edges: applyEdgeChanges(changes, get().edges),
      }),
      onConnect: (connection) => set({
        edges: addEdge(connection, get().edges),
      }),
      
      setNodes: (nodes) => set((state) => ({ 
        nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes 
      })),
      setEdges: (edges) => set((state) => ({ 
        edges: typeof edges === 'function' ? edges(state.edges) : edges 
      })),
      
      updateNodeData: (nodeId, data) => set({
        nodes: get().nodes.map((node) => 
          node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
        ),
      }),

      updateNodeStatus: (nodeId, status) => set({
        nodes: get().nodes.map((node) => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, status } } 
            : node
        ),
      }),

      setName: (name) => set({ name }),
      
      createNewWorkflow: () => set({
        workflowId: uuidv4(),
        name: 'Untitled Workflow',
        nodes: [],
        edges: [],
        selectedNodeId: null
      })
    }),
    {
      name: 'eventflux-workflow-storage', 
    }
  )
);