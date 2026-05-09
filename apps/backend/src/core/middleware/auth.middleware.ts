import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '@eventflux/config';


declare global {
  namespace Express {
    interface Request {
      user?: { id: string; tenantId: string; role: string };
      tenantId?: string; 
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.backend.jwtSecret) as any;
    req.user = decoded;
    req.tenantId = decoded.tenantId; 
    
    next();
  } catch (err) {
    res.status(401).json({ error: 'Session expired or invalid' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};