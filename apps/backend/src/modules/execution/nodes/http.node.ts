import { NodeExecutor, ExecutionContext } from './nodes.interface.js';

export class HttpNode implements NodeExecutor {
  async execute(node: any, context: ExecutionContext): Promise<any> {
    try {
      console.log(`\n=======================================`);
      console.log(`🚀 [HTTP Node] Starting execution for node: ${node.id}`);
      
      // 1. Safely extract config whether it's nested or flat
      const config = node.data?.config || node.data || {};
      
      const url = config.url;
      const method = (config.method || 'GET').toUpperCase();
      const headers = config.headers || {};
      const body = config.body;

      console.log(`[HTTP Node] Extracted Config -> Method: ${method}, URL: ${url}`);

      // 2. Hard validation on URL
      if (!url || typeof url !== 'string' || url.trim() === '') {
        throw new Error(`Missing or invalid URL. Received: ${url}`);
      }

      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch (e) {
        throw new Error(`Invalid URL format. Received: ${url}`);
      }

      // 3. Bulletproof Header Parsing
      let safeHeaders: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (typeof headers === 'string' && headers.trim() !== '') {
        try {
          const parsed = JSON.parse(headers);
          safeHeaders = { ...safeHeaders, ...parsed };
        } catch (e) {
          throw new Error(`Failed to parse Headers JSON: ${(e as Error).message}`);
        }
      } else if (typeof headers === 'object' && headers !== null) {
        safeHeaders = { ...safeHeaders, ...headers };
      }

      // 4. Construct Fetch Options
      const options: RequestInit = {
        method: method,
        headers: safeHeaders
      };

      if (method !== 'GET' && method !== 'HEAD' && body) {
        options.body = typeof body === 'string' ? body : JSON.stringify(body);
        console.log(`[HTTP Node] Appended Body:`, options.body);
      }

      console.log(`[HTTP Node] Executing fetch to ${parsedUrl.toString()}...`);
      
      // 5. Execute
      const response = await fetch(parsedUrl.toString(), options);
      
      let responseData;
      const contentType = response.headers.get("content-type") || "";
      
      if (contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        throw new Error(`Target server rejected request with status ${response.status}: ${JSON.stringify(responseData)}`);
      }

      console.log(`✅ [HTTP Node] Success! Status: ${response.status}`);
      console.log(`=======================================\n`);

      return {
        status: response.status,
        data: responseData
      };

    } catch (error: any) {
      console.error(`\n❌ [HTTP Node] FATAL CRASH:`);
      console.error(error);
      console.log(`=======================================\n`);
      
      // Force the orchestrator to save a readable string instead of {}
      throw `HTTP Execution Failed: ${error.message || String(error)}`;
    }
  }
}