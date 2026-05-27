
export interface WorkflowPlugin {
  id: string;          
  name: string;        
  execute: (config: any, inputs: any) => Promise<any>;
}

class PluginRegistry {
  private plugins = new Map<string, WorkflowPlugin>();

  register(plugin: WorkflowPlugin) {
    this.plugins.set(plugin.id, plugin);
    console.log(`🔌 [Plugin Registry] Registered: ${plugin.name}`);
  }

  get(id: string): WorkflowPlugin {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Plugin ${id} not found in registry.`);
    }
    return plugin;
  }
}

export const registry = new PluginRegistry();

registry.register({
  id: 'ai_generate',
  name: 'Groq AI Generator',
  execute: async (config, inputs) => {
    console.log('🧠 [PLUGIN] AI Registry module invoked! Simulating 10s delay...');
    await new Promise(resolve => setTimeout(resolve, 10000)); 
    
    console.log('🧠 [PLUGIN] AI finished generating!');
    return { generated_text: "Here is your joke..." };
  }
});
registry.register({
  id: 'http_request',
  name: 'REST API Caller',
  execute: async (config, inputs) => {
    return { status: 200, data: {} };
  }
});