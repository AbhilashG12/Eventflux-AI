import { z } from 'zod';

const NodeSchema = z.object({
  id: z.string().min(1, "Node ID cannot be empty"),
  type: z.enum(['TRIGGER', 'ACTION', 'CONDITION']),
  data: z.object({
    action: z.string().optional(),
    config: z.record(z.string(),z.any()).optional(),
  }).passthrough() 
});


const EdgeSchema = z.object({
  source: z.string(),
  target: z.string()
});


export const CreateWorkflowSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().optional(),
  definition: z.object({
    nodes: z.array(NodeSchema).min(1, "A workflow must have at least 1 node"),
    edges: z.array(EdgeSchema)
  })
});


export type CreateWorkflowDto = z.infer<typeof CreateWorkflowSchema>;