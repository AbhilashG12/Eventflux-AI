import { Request, Response } from 'express';
import { db } from '@eventflux/database';
import { encryptSecret } from '../../core/utils/crypto.utils.js';

export class SecretsController {
  async listSecrets(req: Request, res: Response) {
    try {
      const secrets = await db.secret.findMany({
        where: { tenantId: (req as any).tenantId },
        select: { id: true, name: true, createdAt: true, updatedAt: true }
      });
      res.status(200).json(secrets);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async createSecret(req: Request, res: Response) {
    try {
      const { name, value } = req.body;
      const tenantId = (req as any).tenantId;

      const encryptedValue = encryptSecret(value);

      const secret = await db.secret.create({
        data: {
          tenantId,
          name,
          value: encryptedValue
        },
        select: { id: true, name: true, createdAt: true }
      });

      res.status(201).json(secret);
    } catch (err: any) {
      if (err.code === 'P2002') {
        res.status(400).json({ error: 'Secret with this name already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }

  async deleteSecret(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      
      await db.secret.deleteMany({
        where: { id, tenantId: (req as any).tenantId }
      });
      
      res.status(200).json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete secret' });
    }
  }
}