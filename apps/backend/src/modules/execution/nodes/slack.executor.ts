import axios from 'axios';
import { ExecutionContext } from "./nodes.interface.js";

export class SlackExecutor {
  async execute(node: any, context: ExecutionContext) {
    try {
      // FIX 1: Safely grab config whether it's nested or flat
      const config = node.data?.config || node.data || {};
      const webhookUrl = config.webhookUrl;
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

      throw {
        message: `Slack API Error: ${errorMessage}`,
        stack: error.stack
      };
    }
  }
}