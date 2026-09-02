export interface CountryCodeConfig {
  code: string;       // Calling code with plus, e.g. '+63'
  country: string;    // Country name, e.g. 'Philippines'
  iso: string;        // 2-letter ISO, e.g. 'PH'
  flag: string;       // Emoji flag
  sample: string;     // Example valid input
  validate: (digits: string) => { isValid: boolean; error?: string };
}

export const SUPPORTED_COUNTRIES: Record<string, CountryCodeConfig> = {
  '+63': {
    code: '+63',
    country: 'Philippines',
    iso: 'PH',
    flag: '🇵🇭',
    sample: '9171234567',
    validate: (digits: string) => {
      if (digits.startsWith('0')) {
        return {
          isValid: false,
          error: 'Invalid Philippine mobile number. Enter 10 digits after +63 without the leading 0. Example: 9171234567',
        };
      }
      if (!/^\d+$/.test(digits)) {
        return {
          isValid: false,
          error: 'Philippine mobile number must contain only numeric digits.',
        };
      }
      if (digits.length !== 10) {
        return {
          isValid: false,
          error: `Philippine mobile number must be exactly 10 digits (currently ${digits.length}). Example: 9171234567`,
        };
      }
      if (!digits.startsWith('9')) {
        return {
          isValid: false,
          error: 'Philippine mobile number must begin with 9 (e.g. 9171234567).',
        };
      }
      return { isValid: true };
    },
  },
  '+1': {
    code: '+1',
    country: 'United States / Canada',
    iso: 'US',
    flag: '🇺🇸',
    sample: '4155552671',
    validate: (digits: string) => {
      if (digits.startsWith('0') || digits.startsWith('1')) {
        return { isValid: false, error: 'US/Canada phone number area code cannot start with 0 or 1.' };
      }
      if (!/^\d{10}$/.test(digits)) {
        return { isValid: false, error: 'US/Canada phone number must be exactly 10 digits.' };
      }
      return { isValid: true };
    },
  },
  '+65': {
    code: '+65',
    country: 'Singapore',
    iso: 'SG',
    flag: '🇸🇬',
    sample: '91234567',
    validate: (digits: string) => {
      if (!/^[89]\d{7}$/.test(digits)) {
        return { isValid: false, error: 'Singapore mobile number must be 8 digits starting with 8 or 9.' };
      }
      return { isValid: true };
    },
  },
  '+44': {
    code: '+44',
    country: 'United Kingdom',
    iso: 'GB',
    flag: '🇬🇧',
    sample: '7911123456',
    validate: (digits: string) => {
      if (digits.startsWith('0')) {
        return { isValid: false, error: 'UK phone number must not include the leading 0.' };
      }
      if (!/^\d{10,11}$/.test(digits)) {
        return { isValid: false, error: 'UK phone number must be 10 or 11 digits without leading 0.' };
      }
      return { isValid: true };
    },
  },
  '+61': {
    code: '+61',
    country: 'Australia',
    iso: 'AU',
    flag: '🇦🇺',
    sample: '412345678',
    validate: (digits: string) => {
      if (digits.startsWith('0')) {
        return { isValid: false, error: 'Australian phone number must not include the leading 0.' };
      }
      if (!/^\d{9}$/.test(digits)) {
        return { isValid: false, error: 'Australian mobile number must be exactly 9 digits without leading 0.' };
      }
      return { isValid: true };
    },
  },
  '+81': {
    code: '+81',
    country: 'Japan',
    iso: 'JP',
    flag: '🇯🇵',
    sample: '9012345678',
    validate: (digits: string) => {
      if (digits.startsWith('0')) {
        return { isValid: false, error: 'Japanese phone number must not include the leading 0.' };
      }
      if (!/^\d{10}$/.test(digits)) {
        return { isValid: false, error: 'Japanese mobile number must be exactly 10 digits without leading 0.' };
      }
      return { isValid: true };
    },
  },
  '+852': {
    code: '+852',
    country: 'Hong Kong',
    iso: 'HK',
    flag: '🇭🇰',
    sample: '51234567',
    validate: (digits: string) => {
      if (!/^\d{8}$/.test(digits)) {
        return { isValid: false, error: 'Hong Kong mobile number must be exactly 8 digits.' };
      }
      return { isValid: true };
    },
  },
  '+971': {
    code: '+971',
    country: 'United Arab Emirates',
    iso: 'AE',
    flag: '🇦🇪',
    sample: '501234567',
    validate: (digits: string) => {
      if (digits.startsWith('0')) {
        return { isValid: false, error: 'UAE phone number must not include the leading 0.' };
      }
      if (!/^\d{9}$/.test(digits)) {
        return { isValid: false, error: 'UAE phone number must be exactly 9 digits without leading 0.' };
      }
      return { isValid: true };
    },
  },
};

export function validatePhoneNumber(
  countryCode: string,
  localNumber: string
): { isValid: boolean; error?: string; formatted?: string } {
  const normalizedCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  const cleanDigits = (localNumber || '').replace(/[\s\-_()]/g, '');

  if (!cleanDigits) {
    return { isValid: false, error: 'Mobile number is required.' };
  }

  const countryConfig = SUPPORTED_COUNTRIES[normalizedCode];
  if (countryConfig) {
    const result = countryConfig.validate(cleanDigits);
    if (!result.isValid) {
      return { isValid: false, error: result.error };
    }
    return {
      isValid: true,
      formatted: `${normalizedCode}${cleanDigits}`,
    };
  }

  // General fallback for any other country code
  if (!/^\d{7,15}$/.test(cleanDigits)) {
    return {
      isValid: false,
      error: 'Phone number must contain between 7 and 15 digits.',
    };
  }

  return {
    isValid: true,
    formatted: `${normalizedCode}${cleanDigits}`,
  };
}
