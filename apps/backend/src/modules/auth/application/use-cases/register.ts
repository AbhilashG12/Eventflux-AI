import bcrypt from 'bcrypt';
import { db } from '@eventflux/database';
import { TokenService } from '../../infrastructure/token.service.js';

export class RegisterUseCase {
  private tokenService = new TokenService();

  async execute(input: any) {
    return await db.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email: input.email } });
      if (existingUser) throw new Error('Email already in use');
      const tenant = await tx.tenant.create({
        data: { 
          name: input.companyName, 
          slug: input.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') 
        }
      });
      const passwordHash = await bcrypt.hash(input.password, 10);
      const user = await tx.user.create({
        data: {
          email: input.email,
          password : passwordHash,
          tenantId: tenant.id,
          role: 'ADMIN' 
        }
      });
      const token = this.tokenService.generate({
        id: user.id,
        tenantId: tenant.id,
        role: user.role
      });

      return { 
        message: 'Registration successful',
        token, 
        user: { id: user.id, email: user.email, role: user.role },
        tenant: { id: tenant.id, name: tenant.name, apiKey: tenant.apiKey }
      };
    });
  }
}