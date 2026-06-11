import { Resend } from 'resend';
import { NodeExecutor, ExecutionContext } from './nodes.interface.js';
import { logger } from '@eventflux/logger';

export class EmailExecutor implements NodeExecutor {
  async execute(node: any, context: ExecutionContext): Promise<any> {
    try {
      // Safely grab config whether it's nested or flat
      const config = node.data?.config || node.data || {};
      const to = config.to;
      const subject = config.subject || 'EventFlux Automation';
      const body = config.body || 'Empty message body.';

      if (!to) {
        throw new Error("Missing 'to' email address in node configuration.");
      }
      
      // 🚀 THE FIX: Grab Resend key directly from context. Zero database lookups required!
      const userResendKey = context.secrets['RESEND_API_KEY'] || config.apiKey;

      if (!userResendKey) {
        throw new Error("Missing RESEND_API_KEY. Please add this to your workspace secrets.");
      }

      const resend = new Resend(userResendKey);

      logger.info(`📧 Attempting to send email to ${to}...`);
      
      const response = await resend.emails.send({
        from: 'EventFlux <onboarding@resend.dev>', // Ensure this domain is verified in Resend!
        to: [to],
        subject: subject,
        html: `<div style="font-family: sans-serif; padding: 20px;">${body.replace(/\n/g, '<br/>')}</div>`,
      });

      if (response.error) {
        throw new Error(`Resend API Error: ${response.error.message}`);
      }

      return {
        success: true,
        provider: 'resend',
        messageId: response.data?.id,
        deliveredTo: to
      };
      
    } catch (error: any) {
      logger.error(error, "🚨 EMAIL EXECUTION FAILED");
      
      // 🚀 THE FIX: Throw standard Error object
      throw new Error(`Email Execution Failed: ${error.message || String(error)}`);
    }
  }
}