import { Request, Response, NextFunction } from 'express';
import { logger } from '@eventflux/logger';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      user?: any;
    }
  }
}

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] as string;

  if (!tenantId) {
    logger.warn(`Access denied: No Tenant ID for ${req.method} ${req.url}`);
    return res.status(403).json({ error: 'Tenant context missing' });
  }
  req.tenantId = tenantId;
  next();
};