export function validateUpdateProfile(data: any): { isValid: boolean; errors?: Record<string, string>; value?: any } {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { form: 'Request body must be an object' } };
  }

  if (data.firstName !== undefined && (typeof data.firstName !== 'string' || data.firstName.trim().length === 0)) {
    errors.firstName = 'First name cannot be empty.';
  }

  if (data.lastName !== undefined && (typeof data.lastName !== 'string' || data.lastName.trim().length === 0)) {
    errors.lastName = 'Last name cannot be empty.';
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    value: {
      first_name: data.firstName?.trim(),
      last_name: data.lastName?.trim(),
      phone: data.phone?.trim(),
      company_name: data.companyName?.trim(),
      avatar_url: data.avatarUrl?.trim(),
    },
  };
}

export function validatePaymentIntent(data: any): { isValid: boolean; errors?: Record<string, string>; value?: any } {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { form: 'Request body must be an object' } };
  }

  if (!data.bookingId || typeof data.bookingId !== 'string') {
    errors.bookingId = 'bookingId is required.';
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    value: {
      bookingId: data.bookingId,
      paymentMethodType: data.paymentMethodType || 'card',
    },
  };
}
