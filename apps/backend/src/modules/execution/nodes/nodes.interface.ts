export interface ExecutionContext {
  executionId: string;
  workflowId: string;
  tenantId: string;
  initialPayload: any;
  previousResults: Record<string, any>;
  secrets: Record<string, string>;
}

export interface NodeExecutor {
  execute(node: any, context: ExecutionContext): Promise<any>;
}