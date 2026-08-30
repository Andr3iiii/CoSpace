import { describe, it, expect } from 'vitest';
import { validateClientRegister, validateClientLogin } from '../src/validators/clientAuth.validator';
import { validateCreateBooking } from '../src/validators/clientBooking.validator';

describe('Client Backend Validators', () => {
  it('validates client registration credentials', () => {
    const invalid = validateClientRegister({ email: 'bad-email', password: '123', firstName: '' });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors?.email).toBeDefined();
    expect(invalid.errors?.password).toBeDefined();

    const valid = validateClientRegister({
      email: 'member@cospace.com',
      password: 'StrongPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+639171234567',
    });
    expect(valid.isValid).toBe(true);
    expect(valid.value?.email).toBe('member@cospace.com');
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
});
