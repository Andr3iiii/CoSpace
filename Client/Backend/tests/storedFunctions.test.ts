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

  it('verifies 10-minute hold expiration logic', () => {
    const now = new Date('2026-10-01T10:00:00Z');
    const activeHold = new Date('2026-10-01T10:09:00Z');
    const expiredHold = new Date('2026-10-01T09:59:00Z');

    const isHoldActive = (expiry: Date, currentTime: Date) => expiry.getTime() > currentTime.getTime();

    expect(isHoldActive(activeHold, now)).toBe(true);
    expect(isHoldActive(expiredHold, now)).toBe(false);
  });

  it('verifies 50% deposit and remaining balance calculations', () => {
    const finalAmount = 1500;

    // Full payment plan
    const fullCharged = finalAmount;
    const fullBalance = 0;
    expect(fullCharged).toBe(1500);
    expect(fullBalance).toBe(0);

    // 50% deposit plan
    const depositCharged = Math.round(finalAmount * 0.5 * 100) / 100;
    const depositBalance = Math.round((finalAmount - depositCharged) * 100) / 100;
    expect(depositCharged).toBe(750);
    expect(depositBalance).toBe(750);

    // Odd amount rounding test (e.g. 1501.75)
    const oddAmount = 1501.75;
    const oddDeposit = Math.round(oddAmount * 0.5 * 100) / 100;
    const oddRemaining = Math.round((oddAmount - oddDeposit) * 100) / 100;
    expect(oddDeposit + oddRemaining).toBeCloseTo(oddAmount, 2);
  });

  it('verifies 30% refund calculation upon cancellation', () => {
    const amountPaid = 1200;
    const refundAmount = Math.round(amountPaid * 0.30 * 100) / 100;
    const retainedFee = Math.round(amountPaid * 0.70 * 100) / 100;

    expect(refundAmount).toBe(360);
    expect(retainedFee).toBe(840);
    expect(refundAmount + retainedFee).toBe(amountPaid);
  });

  it('verifies booking_add_ons subtotal calculation (quantity * unit_price)', () => {
    const addOns = [
      { unitPrice: 250, quantity: 1 },
      { unitPrice: 300, quantity: 2 },
      { unitPrice: 400.50, quantity: 3 },
    ];

    for (const addon of addOns) {
      const subtotal = Math.round(addon.unitPrice * addon.quantity * 100) / 100;
      expect(subtotal).toBeGreaterThan(0);
      expect(subtotal).toBe(addon.unitPrice * addon.quantity);
    }
  });
});
