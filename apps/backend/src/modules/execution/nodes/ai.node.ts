import { NodeExecutor, ExecutionContext } from './nodes.interface.js';
import { db } from '@eventflux/database';
import { decryptSecret } from '../../../core/utils/crypto.utils.js';

export class AiNode implements NodeExecutor {
  async execute(node: any, context: ExecutionContext): Promise<any> {
    const { prompt, provider = 'groq', model = 'llama-3.1-8b-instant' } = node.data?.config || {};
    
    if (!prompt) {
      throw new Error("AI Node requires a prompt in its config");
    }

    const secretName = provider.toLowerCase() === 'openai' ? 'OPENAI_API_KEY' : 'GROQ_API_KEY';
    const baseUrl = provider.toLowerCase() === 'openai' 
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.groq.com/openai/v1/chat/completions';

    const secretRecord = await db.secret.findFirst({
      where: { tenantId: context.tenantId, name: secretName }
    });

    if (!secretRecord) {
      throw new Error(`${secretName} not found in Workspace Secrets Vault`);
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

    return {
      provider,
      model,
      reply: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens
    };
  }
}