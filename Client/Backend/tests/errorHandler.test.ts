import { describe, it, expect } from 'vitest';
import { AppError } from '../src/utils/errors';
import { ERROR_CODES } from '../src/constants';

describe('Application Error Handling & Status Code Mapping (Priority 2)', () => {
  it('instantiates AppError with correct status codes and defaults', () => {
    const defaultErr = new AppError('General request error');
    expect(defaultErr.statusCode).toBe(400);
    expect(defaultErr.code).toBe('ERROR');
    expect(defaultErr.isOperational).toBe(true);

    const authErr = new AppError('Invalid email or password credentials.', 401, ERROR_CODES.UNAUTHORIZED);
    expect(authErr.statusCode).toBe(401);
    expect(authErr.code).toBe(ERROR_CODES.UNAUTHORIZED);

    const suspendedErr = new AppError('Your account is currently suspended.', 403, ERROR_CODES.FORBIDDEN);
    expect(suspendedErr.statusCode).toBe(403);
    expect(suspendedErr.code).toBe(ERROR_CODES.FORBIDDEN);

    const notFoundErr = new AppError('Workspace could not be found.', 404, ERROR_CODES.NOT_FOUND);
    expect(notFoundErr.statusCode).toBe(404);
    expect(notFoundErr.code).toBe(ERROR_CODES.NOT_FOUND);

    const conflictErr = new AppError('An account with this email already exists.', 409, ERROR_CODES.CONFLICT);
    expect(conflictErr.statusCode).toBe(409);
    expect(conflictErr.code).toBe(ERROR_CODES.CONFLICT);

    const bookingConflictErr = new AppError('The selected time slot was just booked.', 409, ERROR_CODES.BOOKING_CONFLICT);
    expect(bookingConflictErr.statusCode).toBe(409);
    expect(bookingConflictErr.code).toBe(ERROR_CODES.BOOKING_CONFLICT);
  });
});
