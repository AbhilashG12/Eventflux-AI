import { Router, Request, Response } from 'express';
import { db } from '@eventflux/database';
import { requireAuth, requireRole } from '../../../core/middleware/auth.middleware.js';
import crypto from 'crypto';

export const inviteRoutes: Router = Router();

inviteRoutes.post('/', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;
    const tenantId = (req as any).tenantId as string;

    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!tenantId) return res.status(401).json({ error: "Unauthorized: Missing tenant ID" });


    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite = await db.invitation.create({
      data: { 
        email, 
        token, 
        tenantId,
        expiresAt 
      }
    });

    const inviteLink = `http://localhost:5173/invite/${token}`;

    res.status(201).json({ invite, inviteLink });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate invite" });
  }
});


inviteRoutes.get('/:token', async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.params.token as string;
    
    const invite = await db.invitation.findUnique({
      where: { token },
      include: { tenant: true }
    });

    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    if (invite.status !== 'PENDING') return res.status(400).json({ error: `Invite is already ${invite.status.toLowerCase()}` });
    if (invite.expiresAt < new Date()) return res.status(400).json({ error: 'Invite has expired' });
    res.json({ email: invite.email, tenantName: (invite as any).tenant.name });
  } catch (error) {
    res.status(500).json({ error: "Failed to validate invite" });
  }
});