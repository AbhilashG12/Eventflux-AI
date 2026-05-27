import { NodeExecutor, ExecutionContext } from './nodes.interface.js';

export class HttpNode implements NodeExecutor {
  async execute(node: any, context: ExecutionContext): Promise<any> {
    const { url, method = 'GET', headers = {}, body } = node.data || {};

    if (!url) {
      throw new Error("HTTP Node requires a URL");
    }

    const options: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (options.method !== 'GET' && options.method !== 'HEAD' && body) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    let responseData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      throw new Error(`HTTP Request failed with status ${response.status}: ${JSON.stringify(responseData)}`);
    }

    return {
      status: response.status,
      data: responseData
    };
  }
}