import bcrypt from 'bcrypt';
import { db } from '@eventflux/database';
import { TokenService } from '../../infrastructure/token.service.js';

export class RegisterUseCase {
  private tokenService = new TokenService();

  async execute(input: any) {
    return await db.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email: input.email } });
      if (existingUser) throw new Error('Email already in use');

      let targetTenantId: string;
      let targetRole: "ADMIN" | "MEMBER" = "ADMIN";

      if (input.inviteToken) {
        const invite = await tx.invitation.findUnique({
          where: { token: input.inviteToken }
        });

        if (!invite || invite.status !== 'PENDING' || invite.expiresAt < new Date()) {
          throw new Error('Invalid or expired invite token');
        }

        if (invite.email !== input.email) {
          throw new Error('Email does not match the invitation');
        }

        targetTenantId = invite.tenantId;
        targetRole = 'MEMBER'; 
        await tx.invitation.update({
          where: { id: invite.id },
          data: { status: 'ACCEPTED' }
        });
      } 
      else {
        if (!input.companyName) throw new Error('Company name is required for new workspaces');

        const tenant = await tx.tenant.create({
          data: { 
            name: input.companyName, 
            slug: input.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') 
          }
        });
        targetTenantId = tenant.id;
      }

      // Create the user attached to the correct Tenant
      const passwordHash = await bcrypt.hash(input.password, 10);
      const user = await tx.user.create({
        data: {
          email: input.email,
          password: passwordHash,
          tenantId: targetTenantId,
          role: targetRole 
        }
      });


      const finalTenant = await tx.tenant.findUnique({ where: { id: targetTenantId } });

      const token = this.tokenService.generate({
        id: user.id,
        tenantId: targetTenantId,
        role: user.role
      });

      return { 
        message: 'Registration successful',
        token, 
        user: { id: user.id, email: user.email, role: user.role },
        tenant: { id: finalTenant!.id, name: finalTenant!.name, apiKey: finalTenant!.apiKey }
      };
    });
  }
}