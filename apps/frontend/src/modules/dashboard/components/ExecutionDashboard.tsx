import { useExecutionTelemetry } from '../hooks/useExecutionTelemetry';
import { ExecutionSidebar } from './ExecutionSidebar';
import { ExecutionTerminal } from './ExecutionTerminal';

export const ExecutionDashboard = ({ workflowNodes }: { workflowNodes: any[] }) => {
  const WORKFLOW_ID = 'bd597b4f-b22c-428d-a137-c5c4b66edf32'; 
  
  const { 
    executions, 
    selectedExecutionId, 
    setSelectedExecutionId, 
    logs, 
    activeStatus 
  } = useExecutionTelemetry(WORKFLOW_ID);

  return (
    <div className="max-w-7xl mx-auto p-6 h-[80vh] flex gap-6 animate-in fade-in">
      <ExecutionSidebar 
        executions={executions} 
        selectedId={selectedExecutionId} 
        onSelect={setSelectedExecutionId} 
      />
      <ExecutionTerminal 
        logs={logs} 
        executionId={selectedExecutionId} 
        status={activeStatus} 
      />
    </div>
  );
};