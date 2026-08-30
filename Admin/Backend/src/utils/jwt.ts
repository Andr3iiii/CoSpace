import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AdminJwtPayload } from '../types';

export function generateAdminToken(payload: Omit<AdminJwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'admin' }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
}

export function verifyAdminToken(token: string): AdminJwtPayload {
  const decoded = jwt.verify(token, config.jwt.secret) as AdminJwtPayload;
  if (decoded.type !== 'admin') {
    throw new Error('Invalid token type');
  }
  return decoded;
}
