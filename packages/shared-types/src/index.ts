
export type NodeType = 'TRIGGER' | 'AI_ACTION' | 'SEND_EMAIL';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  data: any;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ExecutionEvent {
  executionId: string;
  tenantId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}