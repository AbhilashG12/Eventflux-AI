import { IActionPlugin, ActionResult } from './plugin/plugin.interface.js';
import { HttpPlugin } from './plugin/http.plugin.js';
import { AiPlugin } from './plugin/ai.plugin.js';
import { logger } from '@eventflux/logger';

class Registry {
  private plugins = new Map<string, IActionPlugin>();

  constructor() {
    this.register(new HttpPlugin());
    this.register(new AiPlugin());
  }

  register(plugin: IActionPlugin) {
    this.plugins.set(plugin.id, plugin);
  }

  async execute(actionId: string, payload: any, config: any = {}): Promise<ActionResult> {
    if (actionId === 'send_welcome_email') {
      logger.info(`⚙️ Executing legacy action: ${actionId}`);
      await new Promise(resolve => setTimeout(resolve, 500)); 
      return { success: true, data: { messageId: 'msg_' + Date.now(), recipient: payload.email } };
    }
    const plugin = this.plugins.get(actionId);
    
    if (!plugin) {
      logger.error(`❌ Plugin not found: ${actionId}`);
      return { success: false, error: `Unknown action type: ${actionId}` };
    }
    logger.info(`⚙️ Executing plugin action: ${actionId}`);
    return await plugin.execute(payload, config);
  }
}

export const ActionRegistry = new Registry();