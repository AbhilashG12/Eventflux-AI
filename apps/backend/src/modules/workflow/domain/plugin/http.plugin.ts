import { IActionPlugin, ActionResult } from './plugin.interface.js';
import { logger } from '@eventflux/logger';

export class HttpPlugin implements IActionPlugin {
  readonly id = 'http_request';

  async execute(payload: any, config: any): Promise<ActionResult> {
    try {
      const { url, method = 'GET', headers = {}, bodyTemplate } = config;
      
      if (!url) throw new Error("HTTP Plugin requires a 'url' in config");
      const finalUrl = this.hydrateTemplate(url, payload);
      const finalBody = bodyTemplate ? this.hydrateTemplate(JSON.stringify(bodyTemplate), payload) : undefined;

      logger.info(`🌐 Executing HTTP ${method} to ${finalUrl}`);

      const response = await fetch(finalUrl, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: finalBody ? finalBody : undefined
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${JSON.stringify(responseData)}` };
      }

      return { success: true, data: responseData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  
  private hydrateTemplate(template: string, payload: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const value = key.trim().split('.').reduce((obj: any, prop: string) => {
        return obj ? obj[prop] : undefined;
      }, payload);
      if (value !== undefined && value !== null) {
        return typeof value === 'string' ? value.replace(/"/g, '\\"').replace(/\n/g, '\\n') : String(value);
      }
      return '';
    });
  }
}