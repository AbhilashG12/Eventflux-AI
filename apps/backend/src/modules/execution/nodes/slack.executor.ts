import axios from 'axios';
import { ExecutionContext } from "./nodes.interface.js";

export class SlackExecutor {
  async execute(node: any, context: ExecutionContext) {
    const webhookUrl = node.data?.config?.webhookUrl;
    const finalMessage = node.data?.config?.message;

    if (!webhookUrl || !finalMessage) {
      throw new Error("Slack node is missing webhook URL or message body.");
    }

    try {
      const response = await axios.post(webhookUrl, {
        text: finalMessage
      });
      return {
        status: response.status,
        deliveredMessage: finalMessage,
        provider: "slack"
      };
    } catch (error: any) {
      throw new Error(`Slack API Error: ${error.response?.data || error.message}`);
    }
  }
}