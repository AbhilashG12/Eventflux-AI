import { useEffect } from 'react';
import { socketClient } from '../../../core/websocket/socket.client.js';
import { useExecutionStore } from '../../../core/store/execution.store.js';

export const ExecutionDashboard = ({ workflowNodes }: { workflowNodes: any[] }) => {
  const { nodeStatuses, logs, updateNodeStatus } = useExecutionStore();

  useEffect(() => {
    socketClient.connect();
    
    socketClient.subscribe('node_status_update', (payload) => {
      const logMessage = payload.status === 'FAILED' 
        ? `Error: ${payload.error}` 
        : `Completed successfully.`;
        
      updateNodeStatus(payload.nodeId, payload.status, logMessage);
    });
    return () => {
      socketClient.unsubscribe('node_status_update');
    };
  }, [updateNodeStatus]);

  return (
    <div className="execution-dashboard">
      <h3>Live Execution Run</h3>
      <div className="status-tracker">
        {workflowNodes.map((node) => {
          const status = nodeStatuses[node.id] || 'PENDING';
          return (
            <div key={node.id} className={`node-badge status-${status.toLowerCase()}`}>
              {node.data.label || node.type} - {status}
            </div>
          );
        })}
      </div>

 
      <div className="log-terminal">
        {logs.length === 0 ? <p>Waiting for execution to start...</p> : null}
        {logs.map((log, i) => (
          <div key={i} className="log-entry">
            <span className="timestamp">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className="node-id"> {log.nodeId}: </span>
            <span className="message">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};