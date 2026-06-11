import axios from 'axios';
import { NodeExecutor, ExecutionContext } from './nodes.interface.js';

export class SlackExecutor implements NodeExecutor {
  async execute(node: any, context: ExecutionContext): Promise<any> {
    try {
      // FIX 1: Safely grab config whether it's nested or flat
      const config = node.data?.config || node.data || {};
      
      // 🚀 NEW: Check the secrets vault first, fallback to node config
      const webhookUrl = context.secrets['SLACK_WEBHOOK_URL'] || config.webhookUrl;
      const finalMessage = config.message;

      if (!webhookUrl || !finalMessage) {
        throw new Error("Slack node is missing webhook URL or message body.");
      }

      const response = await axios.post(webhookUrl, {
        text: finalMessage
      });
      
      return {
        status: response.status,
        deliveredMessage: finalMessage,
        provider: "slack"
      };
      
    } catch (error: any) {
      // FIX 2: Safely extract Axios errors and force standard object format
      const errorMessage = error.response?.data 
        ? (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)) 
        : error.message;

      // 🚀 THE FIX: Throw a standard error object
      throw new Error(`Slack API Error: ${errorMessage}`);
    }
  }
}