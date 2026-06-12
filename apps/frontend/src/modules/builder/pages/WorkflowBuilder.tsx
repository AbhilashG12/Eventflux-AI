import { useRef, useState } from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider, BackgroundVariant } from 'reactflow';

import 'reactflow/dist/style.css';
import { useShallow } from 'zustand/react/shallow';
import { useWorkflowStore } from '../../../core/store/workflow.store';
import { useAuthStore } from "../../../core/store/auth.store";
import { useWorkflowActions } from '../hooks/useWorkflowActions';
import { useWorkflowDragDrop } from '../hooks/useWorkflowDragDrop';
import { useTelemetry } from '../../../hooks/useTelemetry';
import { ActionNode } from '../components/ActionNode';
import { SlackNode } from '../components/nodes/SlackNode';
import { NodePalette } from '../components/NodePalette';
import { ConfigPanel } from '../components/ConfigPanel';
import { BuilderHeader } from '../components/BuilderHeader';
import { ExecutionLogsDrawer } from '../../../components/ExecutionLogsDrawer';
import { ApprovalNode } from "../components/nodes/ApprovalNode";

const nodeTypes = { 
  ACTION: ActionNode,
  TRIGGER: ActionNode,
  CONDITION: ActionNode,
  slack: SlackNode, 
  APPROVAL: ApprovalNode
};

const BuilderCore = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  
  const { 
    nodes, edges, onNodesChange, onEdgesChange, onConnect, setSelectedNodeId 
  } = useWorkflowStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
      setSelectedNodeId: state.setSelectedNodeId,
    }))
  );

  const token = useAuthStore((state: any) => state.token);
  useTelemetry(token); 

  const { isSaving, isPublishing, workflowStatus, onSave, onPublish, onTestRun } = useWorkflowActions(() => setIsLogsOpen(true));
  
  const { onDragOver, onDrop } = useWorkflowDragDrop(
    reactFlowWrapper as React.RefObject<HTMLDivElement>
  );

  return (
    <div className="w-full h-full flex flex-col relative z-10 overflow-hidden bg-[#050505]">
      <BuilderHeader 
        onSave={onSave} 
        isSaving={isSaving} 
        onPublish={onPublish}
        isPublishing={isPublishing}
        workflowStatus={workflowStatus}
        onTestRun={onTestRun} 
        onToggleLogs={() => setIsLogsOpen(!isLogsOpen)} 
      />

      <div className="flex-1 w-full flex overflow-hidden relative">
        <NodePalette />
        
        <div className="flex-1 relative bg-[#050505]" ref={reactFlowWrapper}>
          
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none z-0 mix-blend-screen" />
          
          <ReactFlow
            nodes={nodes}
            edges={edges} // <-- Passed directly from Zustand, zero render-time manipulation
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            nodeTypes={nodeTypes}
            fitView // 🚀 THE FIX 2: Forces the camera to snap to the injected template nodes instantly
            fitViewOptions={{ padding: 0.2, maxZoom: 1.5 }}
            style={{ background: 'transparent' }}
            proOptions={{ hideAttribution: true }}
          >
            <Background 
              id="major-grid"
              variant={BackgroundVariant.Lines} 
              gap={96} 
              color="rgba(255,255,255,0.08)" 
              lineWidth={1} 
            />
            <Background 
              id="minor-grid"
              variant={BackgroundVariant.Lines} 
              gap={24} 
              color="rgba(255,255,255,0.03)" 
              lineWidth={1} 
            />
            
            <Controls 
              className="fill-gray-400 bg-black/60 border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden [&>button]:border-b [&>button]:border-white/5 [&>button:hover]:bg-white/10 [&>button:hover]:fill-white transition-all" 
              showInteractive={false} 
            />
          </ReactFlow>

          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_40px_#050505] z-10" />
        </div>

        <ConfigPanel />
        
        <ExecutionLogsDrawer 
          isOpen={isLogsOpen} 
          onClose={() => setIsLogsOpen(false)} 
        />
      </div>
    </div>
  );
};

export const WorkflowBuilder = () => (
  <ReactFlowProvider>
    <BuilderCore />
  </ReactFlowProvider>
);