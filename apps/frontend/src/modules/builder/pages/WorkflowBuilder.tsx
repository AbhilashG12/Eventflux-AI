import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../../../core/store/workflow.store';
import { ActionNode } from '../components/ActionNode';

const nodeTypes = {
  action: ActionNode,

};

export const WorkflowBuilder = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useWorkflowStore();

  const onSave = async () => {
    const workflow = {
      nodes: nodes.map(n => ({ id: n.id, type: n.type, data: n.data })),
      edges: edges.map(e => ({ source: e.source, target: e.target }))
    };
    console.log("Saving DAG:", workflow);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <button onClick={onSave} className="save-btn">Save Workflow</button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};