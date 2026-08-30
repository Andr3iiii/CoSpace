import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { ERROR_CODES } from '../constants';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled Client Backend Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An internal server error occurred.';
  const code = err.code || ERROR_CODES.INTERNAL_ERROR;

  sendError(res, message, statusCode, code, err.details);
}
