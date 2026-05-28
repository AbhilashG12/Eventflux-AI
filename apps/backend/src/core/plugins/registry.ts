import { ExecutionContext } from "../../modules/execution/nodes/nodes.interface.js"

export interface WorkflowPlugin {
  id: string;          
  name: string;        
  execute: (node: any, context: ExecutionContext) => Promise<any>;
}

class PluginRegistry {
  private plugins = new Map<string, WorkflowPlugin>();

  register(plugin: WorkflowPlugin) {
    this.plugins.set(plugin.id, plugin);
    console.log(`🔌 [Plugin Registry] Registered: ${plugin.name}`);
  }

  getExecutor(id: string): WorkflowPlugin {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Plugin ${id} not found in registry.`);
    }
    return plugin;
  }
}

export const pluginRegistry = new PluginRegistry();

pluginRegistry.register({
  id: 'ai_generate',
  name: 'Groq AI Generator',
  execute: async (node, context) => {
    const apiKey = context.secrets['GROQ_API_KEY']; 
    const prompt = node.data?.config?.prompt;

    console.log(`🧠 [PLUGIN] AI executing for workflow: ${context.workflowId}`);
    
    if (!apiKey) {
      throw new Error("CRITICAL: GROQ_API_KEY is missing from the Secrets Vault.");
    }

    if (!prompt) {
      throw new Error("CRITICAL: AI Prompt is empty. Please configure the node in the UI.");
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', 
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Groq API Rate Limit or Error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    return { 
      generated_text: data.choices[0]?.message?.content || "No response generated.",
      model_used: data.model,
      tokens_used: data.usage?.total_tokens
    };
  }
});

pluginRegistry.register({
  id: 'http_request',
  name: 'REST API Caller',
  execute: async (node, context) => {
    console.log(`🌐 [PLUGIN] HTTP Request executing to: ${node.data?.config?.url}`);
    return { status: 200, data: { message: "Success" } };
  }
});