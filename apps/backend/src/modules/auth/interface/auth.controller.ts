import { Request, Response } from 'express';
import { RegisterUseCase } from '../application/use-cases/register.js';
import { LoginUseCase } from '../application/use-cases/login.js';

export class AuthController {
  private registerUseCase = new RegisterUseCase();
  private loginUseCase = new LoginUseCase();

  async register(req: Request, res: Response) {
    try {
      const result = await this.registerUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await this.loginUseCase.execute(req.body);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }
}