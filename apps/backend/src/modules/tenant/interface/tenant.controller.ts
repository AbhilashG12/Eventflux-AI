import { Request, Response } from 'express';
import { db } from '@eventflux/database';
import crypto from 'crypto';

export class TenantController {
  async getSettings(req: Request, res: Response): Promise<any> {
    try {
      const tenantId = (req as any).tenantId;
      const tenant = await db.tenant.findUnique({ 
        where: { id: tenantId },
        select: { id: true, name: true, apiKey: true }
      });

      if (!tenant) return res.status(404).json({ error: "Tenant not found" });

      if (!tenant.apiKey) {
        const newKey = `ef_live_${crypto.randomBytes(16).toString('hex')}`;
        const updated = await db.tenant.update({
          where: { id: tenantId },
          data: { apiKey: newKey }
        });
        return res.json(updated);
      }

      return res.json(tenant);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch tenant settings" });
    }
  }

  async updateDetails(req: Request, res: Response): Promise<any> {
    try {
      const tenantId = (req as any).tenantId;
      const { name } = req.body;

      const tenant = await db.tenant.update({
        where: { id: tenantId },
        data: { name }
      });

      return res.json({ message: "Details updated", tenant });
    } catch (error) {
      return res.status(500).json({ error: "Failed to update details" });
    }
  }

  async rotateApiKey(req: Request, res: Response): Promise<any> {
    try {
      const tenantId = (req as any).tenantId;
      const newKey = `ef_live_${crypto.randomBytes(16).toString('hex')}`;

      const tenant = await db.tenant.update({
        where: { id: tenantId },
        data: { apiKey: newKey }
      });

      return res.json({ apiKey: tenant.apiKey });
    } catch (error) {
      return res.status(500).json({ error: "Failed to rotate key" });
    }
  }
}