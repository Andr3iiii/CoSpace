import { describe, it, expect } from 'vitest';
import {
  isGmailAddress,
  validatePasswordStrength,
  validateSendOtp,
  validateVerifyOtp,
  validateClientRegister,
} from '../src/validators/clientAuth.validator';
import { validatePhoneNumber } from '../src/validators/phone.validator';

describe('Security & Validation Audit: Client Registration, Gmail OTP & Phone Verification', () => {
  describe('1. Email Gmail-Only Requirement', () => {
    it('accepts legitimate Gmail addresses', () => {
      expect(isGmailAddress('john@gmail.com')).toBe(true);
      expect(isGmailAddress('john123@gmail.com')).toBe(true);
      expect(isGmailAddress('john.doe+workspace@gmail.com')).toBe(true);
      expect(isGmailAddress('JOHN.DOE@GMAIL.COM')).toBe(true);
    });

    it('strictly rejects non-Gmail and invalid domains', () => {
      expect(isGmailAddress('john@yahoo.com')).toBe(false);
      expect(isGmailAddress('john@outlook.com')).toBe(false);
      expect(isGmailAddress('john@hotmail.com')).toBe(false);
      expect(isGmailAddress('john@tempmail.com')).toBe(false);
      expect(isGmailAddress('john@gmail')).toBe(false);
      expect(isGmailAddress('@gmail.com')).toBe(false);
      expect(isGmailAddress('john@notgmail.com')).toBe(false);
      expect(isGmailAddress('')).toBe(false);
    });

    it('validateSendOtp rejects non-Gmail addresses with clear error', () => {
      const invalidYahoo = validateSendOtp({ email: 'user@yahoo.com' });
      expect(invalidYahoo.isValid).toBe(false);
      expect(invalidYahoo.errors?.email).toContain('valid Gmail address ending in @gmail.com');

      const validGmail = validateSendOtp({ email: 'user@gmail.com' });
      expect(validGmail.isValid).toBe(true);
      expect(validGmail.value?.email).toBe('user@gmail.com');
    });

    it('validateVerifyOtp validates 6-digit numeric OTP format', () => {
      const invalidShort = validateVerifyOtp({ email: 'user@gmail.com', otp: '123' });
      expect(invalidShort.isValid).toBe(false);
      expect(invalidShort.errors?.otp).toBeDefined();

      const invalidChars = validateVerifyOtp({ email: 'user@gmail.com', otp: '12345a' });
      expect(invalidChars.isValid).toBe(false);

      const validOtp = validateVerifyOtp({ email: 'user@gmail.com', otp: '849201' });
      expect(validOtp.isValid).toBe(true);
      expect(validOtp.value?.otp).toBe('849201');
    });
  });

  describe('2. Philippine & International Mobile Phone Validation', () => {
    it('validates legitimate Philippine numbers (+63 + 10 digits starting with 9)', () => {
      const result = validatePhoneNumber('+63', '9171234567');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('+639171234567');
    });

    it('rejects Philippine mobile numbers with leading 0 with explicit instructions', () => {
      const result = validatePhoneNumber('+63', '09171234567');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('without the leading 0. Example: 9171234567');
    });

    it('rejects Philippine numbers that are too short, too long, or contain letters', () => {
      const tooShort = validatePhoneNumber('+63', '917123456');
      expect(tooShort.isValid).toBe(false);
      expect(tooShort.error).toContain('exactly 10 digits');

      const tooLong = validatePhoneNumber('+63', '91712345678');
      expect(tooLong.isValid).toBe(false);

      const letters = validatePhoneNumber('+63', 'ABC1234567');
      expect(letters.isValid).toBe(false);
      expect(letters.error).toContain('only numeric digits');
    });

    it('supports dynamic foreign country validation (US, SG, UK)', () => {
      const usValid = validatePhoneNumber('+1', '4155552671');
      expect(usValid.isValid).toBe(true);
      expect(usValid.formatted).toBe('+14155552671');

      const sgValid = validatePhoneNumber('+65', '91234567');
      expect(sgValid.isValid).toBe(true);
      expect(sgValid.formatted).toBe('+6591234567');

      const ukValid = validatePhoneNumber('+44', '7911123456');
      expect(ukValid.isValid).toBe(true);
      expect(ukValid.formatted).toBe('+447911123456');
    });
  });

  describe('3. Password Strength (5 Invariants)', () => {
    it('rejects passwords failing any of the 5 criteria', () => {
      // 1. All lowercase (missing uppercase, number, special)
      const allLower = validatePasswordStrength('password');
      expect(allLower.isStrong).toBe(false);
      expect(allLower.errors.length).toBeGreaterThanOrEqual(3);

      // 2. Missing number & special
      const noNumNoSpec = validatePasswordStrength('Password');
      expect(noNumNoSpec.isStrong).toBe(false);

      // 3. Missing special character
      const noSpecial = validatePasswordStrength('Password123');
      expect(noSpecial.isStrong).toBe(false);

      // 4. Missing number
      const noNum = validatePasswordStrength('Password!');
      expect(noNum.isStrong).toBe(false);

      // 5. Missing uppercase
      const noUpper = validatePasswordStrength('password123!');
      expect(noUpper.isStrong).toBe(false);

      // 6. Too short (< 8 chars)
      const tooShort = validatePasswordStrength('Pass1!');
      expect(tooShort.isStrong).toBe(false);
    });

    it('approves passwords that satisfy all 5 requirements', () => {
      const valid1 = validatePasswordStrength('Password123!');
      expect(valid1.isStrong).toBe(true);
      expect(valid1.errors.length).toBe(0);

      const valid2 = validatePasswordStrength('CoSpace#2026Secure');
      expect(valid2.isStrong).toBe(true);
    });
  });

  describe('4. Registration Payload Integrity', () => {
    it('rejects registration when password and confirmPassword mismatch', () => {
      const mismatch = validateClientRegister({
        email: 'john@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
        countryCode: '+63',
        phone: '9171234567',
      });
      expect(mismatch.isValid).toBe(false);
      expect(mismatch.errors?.confirmPassword).toBe('Passwords do not match.');
    });

    it('rejects non-Gmail registration', () => {
      const nonGmail = validateClientRegister({
        email: 'john@yahoo.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        countryCode: '+63',
        phone: '9171234567',
      });
      expect(nonGmail.isValid).toBe(false);
      expect(nonGmail.errors?.email).toContain('@gmail.com');
    });

    it('accepts complete, valid client registration payload', () => {
      const valid = validateClientRegister({
        email: 'john.doe@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        countryCode: '+63',
        phone: '9171234567',
        companyName: 'CoSpace Tech',
      });
      expect(valid.isValid).toBe(true);
      expect(valid.value?.email).toBe('john.doe@gmail.com');
      expect(valid.value?.phone).toBe('+639171234567');
    });
  });
});
