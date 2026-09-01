import { describe, it, expect } from 'vitest';

/**
 * Pure function simulating the PostgreSQL overlap condition:
 * existing.start < requested.end AND existing.end > requested.start
 * with status in ('pending', 'confirmed', 'active')
 */
function isSlotOverlapping(
  existing: { start: Date; end: Date; status: string },
  requested: { start: Date; end: Date }
): boolean {
  const activeStatuses = ['pending', 'confirmed', 'active'];
  if (!activeStatuses.includes(existing.status)) {
    return false;
  }
  return existing.start < requested.end && existing.end > requested.start;
}

describe('Booking Overlap Collision Detection (Priority 1)', () => {
  const baseStart = new Date('2026-10-01T09:00:00Z');
  const baseEnd = new Date('2026-10-01T13:00:00Z');

  it('pending booking blocks overlapping booking', () => {
    const existing = { start: baseStart, end: baseEnd, status: 'pending' };
    const requested = { start: new Date('2026-10-01T10:00:00Z'), end: new Date('2026-10-01T12:00:00Z') };
    expect(isSlotOverlapping(existing, requested)).toBe(true);
  });

  it('confirmed booking blocks overlapping booking', () => {
    const existing = { start: baseStart, end: baseEnd, status: 'confirmed' };
    const requested = { start: new Date('2026-10-01T10:00:00Z'), end: new Date('2026-10-01T12:00:00Z') };
    expect(isSlotOverlapping(existing, requested)).toBe(true);
  });

  it('active booking blocks overlapping booking', () => {
    const existing = { start: baseStart, end: baseEnd, status: 'active' };
    const requested = { start: new Date('2026-10-01T10:00:00Z'), end: new Date('2026-10-01T12:00:00Z') };
    expect(isSlotOverlapping(existing, requested)).toBe(true);
  });

  it('cancelled and expired bookings do not block new reservations', () => {
    const cancelled = { start: baseStart, end: baseEnd, status: 'cancelled' };
    const requested = { start: new Date('2026-10-01T10:00:00Z'), end: new Date('2026-10-01T12:00:00Z') };
    expect(isSlotOverlapping(cancelled, requested)).toBe(false);

    const expired = { start: baseStart, end: baseEnd, status: 'expired' };
    expect(isSlotOverlapping(expired, requested)).toBe(false);
  });

  it('exact same time slot is rejected', () => {
    const existing = { start: baseStart, end: baseEnd, status: 'pending' };
    const requested = { start: new Date('2026-10-01T09:00:00Z'), end: new Date('2026-10-01T13:00:00Z') };
    expect(isSlotOverlapping(existing, requested)).toBe(true);
  });

  it('partial overlap at the beginning is rejected', () => {
    // Existing: 09:00 - 13:00, Requested: 08:00 - 10:00
    const existing = { start: baseStart, end: baseEnd, status: 'pending' };
    const requested = { start: new Date('2026-10-01T08:00:00Z'), end: new Date('2026-10-01T10:00:00Z') };
    expect(isSlotOverlapping(existing, requested)).toBe(true);
  });

  it('partial overlap at the end is rejected', () => {
    // Existing: 09:00 - 13:00, Requested: 12:00 - 15:00
    const existing = { start: baseStart, end: baseEnd, status: 'confirmed' };
    const requested = { start: new Date('2026-10-01T12:00:00Z'), end: new Date('2026-10-01T15:00:00Z') };
    expect(isSlotOverlapping(existing, requested)).toBe(true);
  });

  it('requested booking completely containing existing booking is rejected', () => {
    // Existing: 09:00 - 13:00, Requested: 07:00 - 17:00
    const existing = { start: baseStart, end: baseEnd, status: 'pending' };
    const requested = { start: new Date('2026-10-01T07:00:00Z'), end: new Date('2026-10-01T17:00:00Z') };
    expect(isSlotOverlapping(existing, requested)).toBe(true);
  });

  it('adjacent non-overlapping bookings succeed', () => {
    const existing = { start: baseStart, end: baseEnd, status: 'confirmed' };

    // Exactly adjacent before: 07:00 - 09:00 (ends exactly when existing starts)
    const before = { start: new Date('2026-10-01T07:00:00Z'), end: new Date('2026-10-01T09:00:00Z') };
    expect(isSlotOverlapping(existing, before)).toBe(false);

    // Exactly adjacent after: 13:00 - 17:00 (starts exactly when existing ends)
    const after = { start: new Date('2026-10-01T13:00:00Z'), end: new Date('2026-10-01T17:00:00Z') };
    expect(isSlotOverlapping(existing, after)).toBe(false);
  });
});
