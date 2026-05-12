import { IActionPlugin, ActionResult } from './plugin.interface.js';
import { logger } from '@eventflux/logger';
import Groq from 'groq-sdk';

export class AiPlugin implements IActionPlugin {
  readonly id = 'ai_generate';

  async execute(payload: any, config: any): Promise<ActionResult> {
    try {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("GROQ_API_KEY is missing from your .env file!");
      }
      const groq = new Groq({ apiKey });

      const { promptTemplate, model = 'llama-3.1-8b-instant' } = config;

      if (!promptTemplate) throw new Error("AI Plugin requires a 'promptTemplate' in config");

      const finalPrompt = this.hydrateTemplate(promptTemplate, payload);

      logger.info(`🤖 Executing AI Task with model: ${model}`);

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: finalPrompt }],
        model: model,
        temperature: 0.5,
      });

      const aiResponse = chatCompletion.choices[0]?.message?.content || "";

      return { success: true, data: { result: aiResponse } };
    } catch (error: any) {
      logger.error(`❌ AI Plugin Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  private hydrateTemplate(template: string, payload: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      return payload[key.trim()] || '';
    });
  }
}