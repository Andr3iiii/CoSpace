import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { ERROR_CODES } from '../constants';

export type ValidatorFn<T = any> = (data: unknown) => { isValid: boolean; errors?: Record<string, string>; value?: T };

export function validateBody<T>(validator: ValidatorFn<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validator(req.body);
    if (!result.isValid) {
      sendError(
        res,
        'Invalid request payload.',
        422,
        ERROR_CODES.VALIDATION_ERROR,
        result.errors
      );
      return;
    }
    req.body = result.value || req.body;
    next();
  };
}
