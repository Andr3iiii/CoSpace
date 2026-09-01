import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { ERROR_CODES } from '../constants';
import { AppError } from '../utils/errors';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Handled Operational Application Errors
  if (err instanceof AppError || (err.statusCode && err.statusCode < 500)) {
    sendError(
      res,
      err.message,
      err.statusCode || 400,
      err.code || ERROR_CODES.VALIDATION_ERROR,
      err.details
    );
    return;
  }

  // 2. PostgreSQL Invalid Type / UUID Syntax (22P02)
  if (err.code === '22P02') {
    sendError(
      res,
      'Invalid identifier or parameter format.',
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
    return;
  }

  // 3. PostgreSQL Unique Constraint Violation (23505)
  if (err.code === '23505') {
    sendError(
      res,
      'A record with this unique identifier already exists.',
      409,
      ERROR_CODES.CONFLICT
    );
    return;
  }

  // 4. PostgreSQL Foreign Key Violation (23503)
  if (err.code === '23503') {
    sendError(
      res,
      'Referenced resource does not exist.',
      404,
      ERROR_CODES.NOT_FOUND
    );
    return;
  }

  // 5. PostgreSQL Custom Booking Conflict Exception (23P01)
  if (err.code === '23P01') {
    sendError(
      res,
      err.message || 'The selected time slot was just booked by another member.',
      409,
      ERROR_CODES.BOOKING_CONFLICT
    );
    return;
  }

  // 6. PostgreSQL Invalid Parameter / Date Range Exception (22023)
  if (err.code === '22023') {
    sendError(
      res,
      err.message || 'Invalid request parameter or date interval.',
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
    return;
  }

  // 7. Unhandled / Unexpected Server Error
  console.error('Unhandled Client Backend Server Error:', err);

  const statusCode = err.statusCode || 500;
  const message = 'An internal server error occurred.';
  const code = ERROR_CODES.INTERNAL_ERROR;

  sendError(res, message, statusCode, code);
}

