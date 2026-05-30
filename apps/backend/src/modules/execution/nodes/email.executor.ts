import { Resend } from 'resend';
import { ExecutionContext } from './nodes.interface.js';
import { logger } from '@eventflux/logger';

export class EmailExecutor {
  async execute(node: any, context: ExecutionContext): Promise<any> {
    const config = node.data?.config || {};
    const to = config.to;
    const subject = config.subject || 'EventFlux Automation';
    const body = config.body || 'Empty message body.';

    if (!to) {
      throw new Error("Missing 'to' email address in node configuration.");
    }
    const userResendKey = context.secrets['RESEND_API_KEY'];
    
    if (!userResendKey) {
      throw new Error("Missing RESEND_API_KEY. Please add this to your workspace secrets.");
    }
    const resend = new Resend(userResendKey);

    try {
      logger.info(`📧 Attempting to send email to ${to}...`);
      
      const response = await resend.emails.send({
        from: 'EventFlux <onboarding@resend.dev>',
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
      throw new Error(`Email provider rejected the request: ${error.message}`);
    }
  }
}