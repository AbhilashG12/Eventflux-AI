import { NodeExecutor } from './nodes/nodes.interface.js';
import { HttpExecutor } from './nodes/http.node.js';
import { AiNode } from './nodes/ai.node.js'; 
import { SlackExecutor } from './nodes/slack.executor.js'; 
import { EmailExecutor } from './nodes/email.executor.js';

class PluginRegistry {
  private executors: Map<string, NodeExecutor> = new Map();

  constructor() {
    this.register('http_request', new HttpExecutor());
    this.register('ai_generate', new AiNode()); 
    this.register('slack_message', new SlackExecutor());
    this.register('email_send', new EmailExecutor());
  }

  register(type: string, executor: NodeExecutor) {
    this.executors.set(type, executor);
  }

  getExecutor(type: string): NodeExecutor {
    const executor = this.executors.get(type);
    if (!executor) {
      throw new Error(`No plugin found for node type: ${type}`);
    }
    return executor;
  }
}

export const pluginRegistry = new PluginRegistry();