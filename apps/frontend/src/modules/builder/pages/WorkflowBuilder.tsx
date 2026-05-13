import { useRef } from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../../../core/store/workflow.store';
import { ActionNode } from '../components/ActionNode';
import { NodePalette } from '../components/NodePalette';
import { ConfigPanel } from '../components/ConfigPanel';
import { BuilderHeader } from '../components/BuilderHeader';
import { useWorkflowActions } from '../hooks/useWorkflowActions';
import { useWorkflowDragDrop } from '../hooks/useWorkflowDragDrop';

const nodeTypes = { 
  ACTION: ActionNode,
  TRIGGER: ActionNode,
  CONDITION: ActionNode 
};

const BuilderCore = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const { 
    nodes, edges, onNodesChange, onEdgesChange, onConnect, setSelectedNodeId 
  } = useWorkflowStore();

  const { isSaving, onSave, onTestRun } = useWorkflowActions();
  const { onDragOver, onDrop } = useWorkflowDragDrop(
  reactFlowWrapper as React.RefObject<HTMLDivElement>
);
  return (
    <div className="w-full h-full flex flex-col relative z-10">
      <BuilderHeader onSave={onSave} isSaving={isSaving} onTestRun={onTestRun} />

      <div className="flex-1 w-full flex overflow-hidden">
        <NodePalette />
        
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            nodeTypes={nodeTypes}
            style={{ background: 'transparent' }}
          >
            <Background color="rgba(255,255,255,0.05)" gap={16} size={1.5} />
            <Controls className="fill-white bg-black/50 border-white/10 backdrop-blur-md shadow-2xl" />
          </ReactFlow>
        </div>

        <ConfigPanel />
      </div>
    </div>
  );
};

export const WorkflowBuilder = () => (
  <ReactFlowProvider>
    <BuilderCore />
  </ReactFlowProvider>
);