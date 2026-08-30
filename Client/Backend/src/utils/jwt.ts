import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ClientJwtPayload } from '../types';

export function generateClientToken(payload: Omit<ClientJwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'client' }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
}

export function verifyClientToken(token: string): ClientJwtPayload {
  const decoded = jwt.verify(token, config.jwt.secret) as ClientJwtPayload;
  if (decoded.type !== 'client') {
    throw new Error('Invalid token type for client API');
  }
  return decoded;
}
