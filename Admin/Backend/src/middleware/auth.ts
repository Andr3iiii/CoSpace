import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { ERROR_CODES } from '../constants';
import { AdminJwtPayload } from '../types';

export interface AuthenticatedAdminRequest extends Request {
  admin?: AdminJwtPayload;
}

export function authenticateAdmin(
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication token missing or invalid.', 401, ERROR_CODES.UNAUTHORIZED);
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAdminToken(token);
    req.admin = payload;
    next();
  } catch (err) {
    sendError(res, 'Invalid or expired administrative session.', 401, ERROR_CODES.UNAUTHORIZED);
  }
}

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedAdminRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      sendError(res, 'Unauthenticated request.', 401, ERROR_CODES.UNAUTHORIZED);
      return;
    }

    if (!allowedRoles.includes(req.admin.role) && req.admin.role !== 'superadmin') {
      sendError(
        res,
        'Access denied: You do not possess the required administrative permissions.',
        403,
        ERROR_CODES.FORBIDDEN
      );
      return;
    }

    next();
  };
}
