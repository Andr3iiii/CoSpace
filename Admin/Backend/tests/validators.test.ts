import { describe, it, expect } from 'vitest';
import { validateAdminLogin } from '../src/validators/adminAuth.validator';
import { validateBookingStatusUpdate } from '../src/validators/adminBooking.validator';
import { validateWorkspaceCreate } from '../src/validators/adminWorkspace.validator';

describe('Admin Backend Validators', () => {
  it('validates admin login credentials', () => {
    const invalid = validateAdminLogin({ email: 'bad-email', password: '123' });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors?.email).toBeDefined();
    expect(invalid.errors?.password).toBeDefined();

    const valid = validateAdminLogin({ email: 'admin@cospace.com', password: 'Admin@123456' });
    expect(valid.isValid).toBe(true);
    expect(valid.value?.email).toBe('admin@cospace.com');
  });

  it('validates booking status transitions', () => {
    const invalid = validateBookingStatusUpdate({ status: 'invalid_status' });
    expect(invalid.isValid).toBe(false);

    const valid = validateBookingStatusUpdate({ status: 'confirmed', reason: 'Verified by admin' });
    expect(valid.isValid).toBe(true);
    expect(valid.value?.status).toBe('confirmed');
  });

  it('validates workspace creation parameters', () => {
    const invalid = validateWorkspaceCreate({ name: '' });
    expect(invalid.isValid).toBe(false);

    const valid = validateWorkspaceCreate({
      workspace_type_id: 't0000000-0000-0000-0000-000000000001',
      name: 'Modern Private Suite',
      capacity: 8,
      hourly_rate: 800,
      daily_rate: 5000,
    });
    expect(valid.isValid).toBe(true);
    expect(valid.value?.slug).toBe('modern-private-suite');
  });
});
