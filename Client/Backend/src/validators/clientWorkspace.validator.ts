export interface CheckAvailabilityInput {
  startTime: Date;
  endTime: Date;
}

export function validateCheckAvailability(data: any): {
  isValid: boolean;
  errors?: Record<string, string>;
  value?: CheckAvailabilityInput;
} {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { form: 'Request body must be an object.' } };
  }

  if (!data.startTime || typeof data.startTime !== 'string') {
    errors.startTime = 'startTime is required as an ISO date string.';
  }

  if (!data.endTime || typeof data.endTime !== 'string') {
    errors.endTime = 'endTime is required as an ISO date string.';
  }

  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  if (!errors.startTime && isNaN(startTime.getTime())) {
    errors.startTime = 'Valid startTime ISO string is required.';
  }

  if (!errors.endTime && isNaN(endTime.getTime())) {
    errors.endTime = 'Valid endTime ISO string is required.';
  }

  if (!errors.startTime && !errors.endTime) {
    if (endTime <= startTime) {
      errors.endTime = 'End time must be after start time.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    value: {
      startTime,
      endTime,
    },
  };
}
