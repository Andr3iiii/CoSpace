import { Request, Response, NextFunction } from 'express';
import { verifyClientToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { ERROR_CODES } from '../constants';
import { ClientJwtPayload } from '../types';

export interface AuthenticatedClientRequest extends Request {
  clientUser?: ClientJwtPayload;
}

export function authenticateClient(
  req: AuthenticatedClientRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication token missing.', 401, ERROR_CODES.UNAUTHORIZED);
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyClientToken(token);
    if (payload.status === 'suspended') {
      sendError(res, 'Your client account is currently suspended.', 403, ERROR_CODES.FORBIDDEN);
      return;
    }
    req.clientUser = payload;
    next();
  } catch (err) {
    sendError(res, 'Session expired or invalid.', 401, ERROR_CODES.UNAUTHORIZED);
  }
}
