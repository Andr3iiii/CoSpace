export function validateCreateBooking(data: any): { isValid: boolean; errors?: Record<string, string>; value?: any } {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { form: 'Request body must be an object' } };
  }

  if (!data.workspaceId || typeof data.workspaceId !== 'string') {
    errors.workspaceId = 'workspaceId is required.';
  }

  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  if (isNaN(startTime.getTime())) {
    errors.startTime = 'Valid startTime ISO string is required.';
  }

  if (isNaN(endTime.getTime())) {
    errors.endTime = 'Valid endTime ISO string is required.';
  }

  if (!errors.startTime && !errors.endTime) {
    if (endTime <= startTime) {
      errors.endTime = 'End time must be after start time.';
    }

    if (startTime.getTime() < Date.now() - 5 * 60 * 1000) {
      errors.startTime = 'Start time cannot be in the past.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    value: {
      workspaceId: data.workspaceId,
      startTime,
      endTime,
      addOns: Array.isArray(data.addOns) ? data.addOns : [],
      specialRequests: typeof data.specialRequests === 'string' ? data.specialRequests.trim() : undefined,
    },
  };
}
