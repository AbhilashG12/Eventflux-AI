import { Resend } from 'resend';
import { ExecutionContext } from './nodes.interface.js';
import { logger } from '@eventflux/logger';
import { db } from '@eventflux/database';
import { decryptSecret } from '../../../core/utils/crypto.utils.js';

export class EmailExecutor {
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
      
      if (!context.tenantId) {
        throw new Error("Execution context is missing a valid tenantId.");
      }

      // 🚀 THE FIX: Fetch the secret directly from the database, exactly like AiNode!
      const secretRecord = await db.secret.findFirst({
        where: { tenantId: context.tenantId, name: 'RESEND_API_KEY' }
      });

      if (!secretRecord) {
        throw new Error("Missing RESEND_API_KEY. Please add this to your workspace secrets.");
      }

      const userResendKey = decryptSecret(secretRecord.value);
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
      
      // Force standard error object format so the UI shows the real error instead of {}
      throw {
        message: error.message || "Unknown Email Node Error",
        stack: error.stack
      };
    }
  }
}