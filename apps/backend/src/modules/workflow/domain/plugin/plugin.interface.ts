export interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface IActionPlugin {
  readonly id: string; 
  execute(payload: any, config: any): Promise<ActionResult>;
}