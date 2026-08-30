import { BOOKING_STATUS } from '../constants';

export function validateBookingStatusUpdate(data: any): { isValid: boolean; errors?: Record<string, string>; value?: { status: string; reason?: string } } {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { form: 'Request body must be an object' } };
  }

  const validStatuses = Object.values(BOOKING_STATUS) as string[];
  if (!data.status || !validStatuses.includes(data.status)) {
    errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    value: {
      status: data.status,
      reason: typeof data.reason === 'string' ? data.reason.trim() : undefined,
    },
  };
}

export function validateBookingReschedule(data: any): { isValid: boolean; errors?: Record<string, string>; value?: { startTime: Date; endTime: Date } } {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { form: 'Request body must be an object' } };
  }

  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  if (isNaN(startTime.getTime())) {
    errors.startTime = 'Valid startTime ISO string is required.';
  }

  if (isNaN(endTime.getTime())) {
    errors.endTime = 'Valid endTime ISO string is required.';
  }

  if (!errors.startTime && !errors.endTime && endTime <= startTime) {
    errors.endTime = 'endTime must be strictly after startTime.';
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    value: { startTime, endTime },
  };
}
