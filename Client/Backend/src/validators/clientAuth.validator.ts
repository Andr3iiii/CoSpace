import { validatePhoneNumber } from './phone.validator';

/**
 * Validates that an email is a legitimate Gmail address.
 * Strictly requires the domain to be @gmail.com.
 */
export function isGmailAddress(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  // Ensure valid characters before @ and exactly @gmail.com after
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(trimmed);
}

/**
 * Evaluates password strength against the 5 mandatory criteria:
 * 1. Minimum 8 characters
 * 2. At least 1 uppercase letter
 * 3. At least 1 lowercase letter
 * 4. At least 1 numeric digit
 * 5. At least 1 special symbol
 */
export function validatePasswordStrength(password: string): {
  isStrong: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!password || typeof password !== 'string') {
    return { isStrong: false, errors: ['Password is required.'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z).');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z).');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one numeric digit (0-9).');
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...).');
  }

  return {
    isStrong: errors.length === 0,
    errors,
  };
}

/**
 * Validator for requesting an Email OTP
 */
export function validateSendOtp(data: any): { isValid: boolean; errors?: Record<string, string>; value?: { email: string } } {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { form: 'Request body must be an object' } };
  }

  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';

  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!isGmailAddress(email)) {
    errors.email = 'Registration requires a valid Gmail address ending in @gmail.com.';
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, value: { email } };
}

/**
 * Validator for verifying an Email OTP
 */
export function validateVerifyOtp(data: any): { isValid: boolean; errors?: Record<string, string>; value?: { email: string; otp: string } } {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { form: 'Request body must be an object' } };
  }

  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const otp = typeof data.otp === 'string' ? data.otp.trim() : '';

  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!isGmailAddress(email)) {
    errors.email = 'Registration requires a valid Gmail address ending in @gmail.com.';
  }

  if (!otp) {
    errors.otp = 'Verification code is required.';
  } else if (!/^\d{6}$/.test(otp)) {
    errors.otp = 'Verification code must be exactly 6 numeric digits.';
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, value: { email, otp } };
}

/**
 * Comprehensive Validator for Client Registration
 */
export function validateClientRegister(data: any): { isValid: boolean; errors?: Record<string, string>; value?: any } {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { form: 'Request body must be an object' } };
  }

  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const password = typeof data.password === 'string' ? data.password : '';
  const confirmPassword = typeof data.confirmPassword === 'string' ? data.confirmPassword : '';
  const firstName = typeof data.firstName === 'string' ? data.firstName.trim() : '';
  const lastName = typeof data.lastName === 'string' ? data.lastName.trim() : '';
  const countryCode = typeof data.countryCode === 'string' ? data.countryCode.trim() : '+63';
  const phoneNumber = typeof data.phone === 'string' ? data.phone.trim() : '';

  // 1. Gmail Validation
  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!isGmailAddress(email)) {
    errors.email = 'Please enter a valid Gmail address ending in @gmail.com.';
  }

  // 2. Name Validation
  if (!firstName) {
    errors.firstName = 'First name is required.';
  }
  if (!lastName) {
    errors.lastName = 'Last name is required.';
  }

  // 3. Password Strength Validation
  const passwordResult = validatePasswordStrength(password);
  if (!passwordResult.isStrong) {
    errors.password = passwordResult.errors.join(' ');
  }

  // 4. Confirm Password Match
  if (confirmPassword && confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  // 5. Phone & Country Calling Code Validation
  let formattedPhone: string | undefined;
  if (phoneNumber) {
    const phoneResult = validatePhoneNumber(countryCode, phoneNumber);
    if (!phoneResult.isValid) {
      errors.phone = phoneResult.error || 'Invalid phone number format.';
    } else {
      formattedPhone = phoneResult.formatted;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    value: {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone: formattedPhone,
      company_name: typeof data.companyName === 'string' ? data.companyName.trim() : undefined,
    },
  };
}

/**
 * Validator for Client Login
 */
export function validateClientLogin(data: any): { isValid: boolean; errors?: Record<string, string>; value?: { email: string; password: string } } {
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
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    value: { email, password },
  };
}
