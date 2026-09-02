import { describe, it, expect } from 'vitest';
import { validateClientRegister, validateClientLogin } from '../src/validators/clientAuth.validator';
import { validateCreateBooking } from '../src/validators/clientBooking.validator';
import { validateCheckAvailability } from '../src/validators/clientWorkspace.validator';

describe('Client Backend Validators', () => {
  it('validates client registration credentials', () => {
    const invalid = validateClientRegister({ email: 'bad-email', password: '123', firstName: '' });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors?.email).toBeDefined();
    expect(invalid.errors?.password).toBeDefined();

    const valid = validateClientRegister({
      email: 'member@gmail.com',
      password: 'StrongPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      countryCode: '+63',
      phone: '9171234567',
    });
    expect(valid.isValid).toBe(true);
    expect(valid.value?.email).toBe('member@gmail.com');
  });

  it('validates client login credentials', () => {
    const invalid = validateClientLogin({ email: 'bad-email', password: '' });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors?.email).toBeDefined();
    expect(invalid.errors?.password).toBeDefined();

    const valid = validateClientLogin({
      email: 'client@cospace.com',
      password: 'Client@123456',
    });
    expect(valid.isValid).toBe(true);
    expect(valid.value?.email).toBe('client@cospace.com');
  });

  it('validates booking duration and date integrity', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 3600000);
    const futureStart = new Date(now.getTime() + 86400000);
    const futureEnd = new Date(now.getTime() + 86400000 + 4 * 3600000);

    const pastBooking = validateCreateBooking({
      workspaceId: 'w0000000-0000-0000-0000-000000000001',
      startTime: past.toISOString(),
      endTime: now.toISOString(),
    });
    expect(pastBooking.isValid).toBe(false);

    const validBooking = validateCreateBooking({
      workspaceId: 'w0000000-0000-0000-0000-000000000001',
      startTime: futureStart.toISOString(),
      endTime: futureEnd.toISOString(),
      addOns: [{ addOnId: 'd0000000-0000-0000-0000-000000000001', quantity: 1 }],
    });
    expect(validBooking.isValid).toBe(true);
    expect(validBooking.value?.addOns.length).toBe(1);
  });

  it('validates availability endpoint parameters (Priority 3 Fix)', () => {
    // Empty body
    const emptyCheck = validateCheckAvailability({});
    expect(emptyCheck.isValid).toBe(false);
    expect(emptyCheck.errors?.startTime).toBeDefined();
    expect(emptyCheck.errors?.endTime).toBeDefined();

    // Missing endTime
    const missingEnd = validateCheckAvailability({ startTime: new Date().toISOString() });
    expect(missingEnd.isValid).toBe(false);
    expect(missingEnd.errors?.endTime).toBeDefined();

    // Invalid date strings
    const invalidDates = validateCheckAvailability({ startTime: 'not-a-date', endTime: 'invalid' });
    expect(invalidDates.isValid).toBe(false);
    expect(invalidDates.errors?.startTime).toBeDefined();
    expect(invalidDates.errors?.endTime).toBeDefined();

    // End time before start time
    const start = new Date(Date.now() + 86400000);
    const end = new Date(Date.now() + 43200000); // 12 hours earlier
    const invertedTimes = validateCheckAvailability({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
    expect(invertedTimes.isValid).toBe(false);
    expect(invertedTimes.errors?.endTime).toBe('End time must be after start time.');

    // Valid start and end time
    const validStart = new Date(Date.now() + 86400000);
    const validEnd = new Date(Date.now() + 86400000 + 4 * 3600000);
    const valid = validateCheckAvailability({
      startTime: validStart.toISOString(),
      endTime: validEnd.toISOString(),
    });
    expect(valid.isValid).toBe(true);
    expect(valid.value?.startTime).toBeInstanceOf(Date);
    expect(valid.value?.endTime).toBeInstanceOf(Date);
  });
});
