import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import AppConfig from '../config/AppConfig';
import { JWT_EXPIRY } from '../config/constants';
import AppError from './AppError';

export type JwtPayload = { sub: string; role: Role };

export function signToken(payload: JwtPayload): string {
  const config = AppConfig.getInstance();
  return jwt.sign(payload, config.jwtSecret, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JwtPayload {
  const config = AppConfig.getInstance();
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    return decoded;
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
}
