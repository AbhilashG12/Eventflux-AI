import { logger } from "@eventflux/logger";

export interface ActionResult{
    success : boolean;
    data?:any;
    error?:string;
}

export class ActionRegistry {
  static async execute(actionType: string, payload: any): Promise<ActionResult> {
    logger.info(`⚙️ Executing action: ${actionType}`, payload);

    try {
      switch (actionType) {
        case 'send_welcome_email':
          await new Promise(resolve => setTimeout(resolve, 500)); 
          return { success: true, data: { messageId: 'msg_' + Date.now(), recipient: payload.email } };
        
        case 'http_request':
          return { success: true, data: { status: 200, body: "Mock HTTP Success" } };
          
        default:
          throw new Error(`Unknown action type: ${actionType}`);
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}