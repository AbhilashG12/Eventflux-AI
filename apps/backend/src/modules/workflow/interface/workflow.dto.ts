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
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  definition: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any())
  }).optional()
});


export type CreateWorkflowDto = z.infer<typeof CreateWorkflowSchema>;