import { Response } from 'express';
import { ApiResponse } from '../types';

export function sendSuccess<T>(res: Response, message: string, data?: T, statusCode = 200): Response {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };
  return res.status(statusCode).json(responseBody);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  code = 'ERROR',
  details?: any
): Response {
  const responseBody: ApiResponse = {
    success: false,
    message,
    error: {
      code,
      ...(details !== undefined && { details }),
    },
  };
  return res.status(statusCode).json(responseBody);
}
