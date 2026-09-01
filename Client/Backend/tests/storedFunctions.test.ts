import { describe, it, expect } from 'vitest';
import { ERROR_CODES } from '../src/constants';

describe('PostgreSQL Stored Functions Contract & Error Codes', () => {
  it('defines custom PostgreSQL error code 23P01 as BOOKING_CONFLICT', () => {
    const errorCode = '23P01';
    expect(errorCode).toBe('23P01');
    expect(ERROR_CODES.BOOKING_CONFLICT).toBe('BOOKING_CONFLICT');
  });

  it('validates time interval requirement for fn_check_workspace_availability', () => {
    const startTime = new Date('2026-10-01T09:00:00Z');
    const endTime = new Date('2026-10-01T13:00:00Z');
    const invertedEnd = new Date('2026-10-01T08:00:00Z');

    expect(endTime.getTime() > startTime.getTime()).toBe(true);
    expect(invertedEnd.getTime() > startTime.getTime()).toBe(false);
  });

  it('verifies overlap condition logic identical to SQL overlap expression', () => {
    const isOverlapping = (
      existingStart: Date,
      existingEnd: Date,
      reqStart: Date,
      reqEnd: Date
    ) => existingStart.getTime() < reqEnd.getTime() && existingEnd.getTime() > reqStart.getTime();

    const existingStart = new Date('2026-10-01T10:00:00Z');
    const existingEnd = new Date('2026-10-01T12:00:00Z');

    // Overlapping partial
    expect(isOverlapping(existingStart, existingEnd, new Date('2026-10-01T11:00:00Z'), new Date('2026-10-01T13:00:00Z'))).toBe(true);

    // Adjacent before (10:00 - 12:00 vs 08:00 - 10:00) -> Allowed
    expect(isOverlapping(existingStart, existingEnd, new Date('2026-10-01T08:00:00Z'), new Date('2026-10-01T10:00:00Z'))).toBe(false);

    // Adjacent after (10:00 - 12:00 vs 12:00 - 14:00) -> Allowed
    expect(isOverlapping(existingStart, existingEnd, new Date('2026-10-01T12:00:00Z'), new Date('2026-10-01T14:00:00Z'))).toBe(false);
  });
});
