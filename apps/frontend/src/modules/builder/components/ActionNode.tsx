import { Handle, Position } from 'reactflow';

export const ActionNode = ({ data }: any) => {
  return (
    <div className="action-node-wrapper">
      <Handle type="target" position={Position.Top} />
      <div className="node-header">
        <span>{data.label || 'Action'}</span>
      </div>
      <div className="node-body">
        <small>{data.actionType}</small>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};