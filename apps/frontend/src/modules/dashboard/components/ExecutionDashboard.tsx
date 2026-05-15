import { useExecutionTelemetry } from '../hooks/useExecutionTelemetry';
import { ExecutionSidebar } from './ExecutionSidebar';
import { ExecutionTerminal } from './ExecutionTerminal';
import { useWorkflowStore } from '../../../core/store/workflow.store';

export const ExecutionDashboard = ({ workflowNodes }: { workflowNodes: any[] }) => {
  const activeWorkflowId = useWorkflowStore(state => state.workflowId);
  const { 
    executions, 
    selectedExecutionId, 
    setSelectedExecutionId, 
    logs, 
    activeStatus 
  } = useExecutionTelemetry(activeWorkflowId || '');

  return (
    <div className="max-w-7xl mx-auto p-6 h-full min-h-175 flex gap-6 transition-opacity duration-300">
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