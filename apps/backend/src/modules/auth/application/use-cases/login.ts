import bcrypt from 'bcrypt';
import { db } from '@eventflux/database';
import { TokenService } from '../../infrastructure/token.service.js';

export class LoginUseCase {
  private tokenService = new TokenService();

  async execute(input: any) {
    const user = await db.user.findUnique({ where: { email: input.email } });
    if (!user) throw new Error('Invalid credentials');

    const isValidPassword = await bcrypt.compare(input.password, user.password);
    if (!isValidPassword) throw new Error('Invalid credentials');

    const token = this.tokenService.generate({
      id: user.id,
      tenantId: user.tenantId,
      role: user.role
    });

    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }
}