import { NodeExecutor, ExecutionContext } from './nodes.interface.js';
import { db } from '@eventflux/database';
import { decryptSecret } from '../../../core/utils/crypto.utils.js';

export class AiNode implements NodeExecutor {
  async execute(node: any, context: ExecutionContext): Promise<any> {
    try {
      // FIX 1: Read directly from node.data to match frontend ConfigPanel
      const prompt = node.data?.prompt || node.data?.config?.prompt;
      const provider = node.data?.provider || node.data?.config?.provider || 'groq';
      const model = node.data?.model || node.data?.config?.model || 'llama-3.1-8b-instant';
      
      if (!prompt) {
        throw new Error("AI Node requires a prompt. Check your workflow configuration.");
      }

      const secretName = provider.toLowerCase() === 'openai' ? 'OPENAI_API_KEY' : 'GROQ_API_KEY';
      const baseUrl = provider.toLowerCase() === 'openai' 
        ? 'https://api.openai.com/v1/chat/completions'
        : 'https://api.groq.com/openai/v1/chat/completions';

      if (!context.tenantId) {
        throw new Error("Execution context is missing a valid tenantId.");
      }

      // Fetch the API Key from the DB Vault
      const secretRecord = await db.secret.findFirst({
        where: { tenantId: context.tenantId, name: secretName }
      });

      if (!secretRecord) {
        throw new Error(`${secretName} not found in Workspace Secrets Vault. Please add it to your settings.`);
      }

      const apiKey = decryptSecret(secretRecord.value);

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model, 
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' }, 
            { role: 'user', content: prompt }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`${provider} API failed: ${data.error?.message || response.statusText}`);
      }

      // NOTE: Ensure your Workflow B HTTP node expects this exact key `reply` 
      // Example: {{ai_generate.reply}}
      return {
        provider,
        model,
        reply: data.choices[0].message.content,
        tokensUsed: data.usage?.total_tokens
      };

    } catch (error: any) {
      // FIX 2: Format the error so it survives JSON.stringify and displays in the UI!
      throw {
        message: error.message || "Unknown AI Node Error",
        stack: error.stack
      };
    }
  }
}