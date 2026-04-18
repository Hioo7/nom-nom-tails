import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Role } from '@prisma/client';
import AppError from '../lib/AppError';

export function requireRole(...roles: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient permissions'));
    }
    next();
  };
}
