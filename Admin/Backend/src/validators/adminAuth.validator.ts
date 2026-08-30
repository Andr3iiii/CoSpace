export function validateAdminLogin(data: any): { isValid: boolean; errors?: Record<string, string>; value?: { email: string; password: string } } {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { form: 'Request body must be an object' } };
  }

  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const password = typeof data.password === 'string' ? data.password : '';

  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    value: { email, password },
  };
}
