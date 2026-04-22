import { Request, Response } from 'express';
import { RegisterUseCase } from '../application/use-cases/register';

export class AuthController {
  constructor(private registerUseCase: RegisterUseCase) {}

  async register(req: Request, res: Response) {
    try {
      const result = await this.registerUseCase.execute(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}