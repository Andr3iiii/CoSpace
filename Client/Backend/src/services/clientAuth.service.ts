import crypto from 'crypto';
import { clientAuthRepository } from '../repositories/clientAuth.repository';
import { emailOtpRepository } from '../repositories/emailOtp.repository';
import { getClient, query } from '../database/connection';
import { hashPassword, comparePassword } from '../utils/password';
import { generateClientToken } from '../utils/jwt';
import { resendClient } from '../integrations/resend';
import { AppError } from '../utils/errors';
import { ERROR_CODES } from '../constants';
import { ClientUser } from '../types';

export class ClientAuthService {
  /**
   * Request an Email OTP code
   * Enforces 1 active OTP, 10-minute expiration, 60s cooldown, max 5 sends per 15 minutes
   */
  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = (email || '').toLowerCase().trim();

    // 1. Distinction: Already-registered email address in clients table -> HTTP 409 Conflict
    const existing = await clientAuthRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new AppError(
        'An account with this email address already exists. Please log in instead.',
        409,
        ERROR_CODES.CONFLICT
      );
    }

    // 2. Distinction: 60-second resend cooldown violation -> HTTP 429 Too Many Requests (NOT 409)
    const latestRecord = await emailOtpRepository.getLatestByEmail(normalizedEmail);
    if (latestRecord && latestRecord.last_sent_at) {
      const secondsSinceLastSent = (Date.now() - new Date(latestRecord.last_sent_at).getTime()) / 1000;
      if (secondsSinceLastSent < 60) {
        const waitSeconds = Math.ceil(60 - secondsSinceLastSent);
        throw new AppError(
          `Please wait ${waitSeconds} seconds before requesting a new verification code.`,
          429,
          ERROR_CODES.RATE_LIMITED,
          { remainingCooldown: waitSeconds }
        );
      }
    }

    // 3. Distinction: Rate limit of maximum 5 sends per 15 minutes -> HTTP 429 Too Many Requests (NOT 409)
    const sendsIn15Mins = await emailOtpRepository.countSendsInWindow(normalizedEmail, 15);
    if (sendsIn15Mins >= 5) {
      throw new AppError(
        'Too many verification code requests. Maximum 5 requests allowed per 15 minutes. Please try again later.',
        429,
        ERROR_CODES.RATE_LIMITED
      );
    }

    // 4. Distinction: Existing active OTP (cooldown elapsed) -> Safely invalidate within transaction and issue new OTP
    // Preserves the one-active-OTP-per-email rule without returning 409 Conflict
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otp_hash = await hashPassword(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await emailOtpRepository.createOtpWithInvalidation(normalizedEmail, otp_hash, expiresAt);

    // 5. Dispatch OTP email asynchronously via Resend
    resendClient.sendEmailOtp(normalizedEmail, otp).catch((err) => {
      console.error('Email dispatch error:', err);
    });

    return {
      success: true,
      message: `We sent a 6-digit verification code to ${normalizedEmail}.`,
    };
  }

  /**
   * Verify an Email OTP code with database transaction and row-level FOR UPDATE locking
   * Returns appropriate status codes: 400 (invalid/missing/reused), 401 (incorrect), 410 (expired), 429 (exceeded)
   */
  async verifyOtp(
    email: string,
    otp: string
  ): Promise<{ success: boolean; verified: boolean; verificationToken: string; message: string }> {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const cleanOtp = (otp || '').trim();

    if (!cleanOtp || !/^\d{6}$/.test(cleanOtp)) {
      throw new AppError('Verification code must be exactly 6 numeric digits.', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Row-lock the active OTP record to serialize concurrent verification requests
      const record = await emailOtpRepository.getActiveForUpdate(client, normalizedEmail);
      if (!record) {
        const latest = await emailOtpRepository.getLatestByEmail(normalizedEmail);
        if (latest?.is_verified) {
          throw new AppError('This verification code has already been verified and cannot be reused.', 400, ERROR_CODES.VALIDATION_ERROR);
        }
        if (latest?.is_invalidated) {
          throw new AppError('This verification code has been invalidated. Please request a new code.', 400, ERROR_CODES.VALIDATION_ERROR);
        }
        throw new AppError('No active verification request found for this email. Please request a verification code.', 400, ERROR_CODES.VALIDATION_ERROR);
      }

      // Check expiration (10 minutes) -> HTTP 410 Gone
      if (new Date() > new Date(record.expires_at)) {
        await emailOtpRepository.invalidateRecord(client, record.id, 'Expired');
        await client.query('COMMIT');
        throw new AppError('This verification code has expired. Please request a new code.', 410, ERROR_CODES.EXPIRED);
      }

      // Check maximum failed attempts (>= 5) -> HTTP 429 Too Many Requests
      if (record.attempts >= record.max_attempts) {
        await emailOtpRepository.invalidateRecord(client, record.id, 'Maximum attempts exceeded');
        await client.query('COMMIT');
        throw new AppError('Too many failed verification attempts. Please request a new code.', 429, ERROR_CODES.RATE_LIMITED);
      }

      // Compare supplied OTP against stored bcrypt hash (never reveal stored hash)
      const isMatch = await comparePassword(cleanOtp, record.otp_hash);
      if (!isMatch) {
        const isMaxReached = (record.attempts + 1) >= record.max_attempts;
        const currentAttempts = await emailOtpRepository.incrementAttempts(client, record.id, isMaxReached);
        await client.query('COMMIT');

        const remainingAttempts = Math.max(0, record.max_attempts - currentAttempts);
        if (remainingAttempts === 0) {
          throw new AppError(
            'Too many failed verification attempts. This code is now invalidated. Please request a new code.',
            429,
            ERROR_CODES.RATE_LIMITED
          );
        }

        throw new AppError(
          `Incorrect verification code. Please try again. (${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining)`,
          401,
          ERROR_CODES.UNAUTHORIZED
        );
      }

      // OTP is valid! Mark verified, generate secure token, and invalidate OTP so it cannot be reused
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute registration window
      await emailOtpRepository.markVerified(client, record.id, verificationToken, tokenExpiresAt);

      await client.query('COMMIT');

      return {
        success: true,
        verified: true,
        verificationToken,
        message: 'Email verified successfully.',
      };
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Client Registration with Strict Server-Side Email Verification Guard
   */
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    company_name?: string;
    verificationToken?: string;
  }): Promise<{ token: string; client: Omit<ClientUser, 'password_hash'> }> {
    const normalizedEmail = data.email.toLowerCase().trim();

    // 1. SERVER-SIDE SECURITY INVARIANT: Verify that email OTP was confirmed within last 15 minutes and not consumed
    const verifiedRecord = await emailOtpRepository.findValidVerified(normalizedEmail, data.verificationToken, 15);
    if (!verifiedRecord) {
      throw new AppError(
        'Please verify your Gmail address with OTP before creating your account.',
        400,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // 2. Check duplicate email in clients table
    const existing = await clientAuthRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new AppError(
        'An account with this email address already exists.',
        409,
        ERROR_CODES.CONFLICT
      );
    }

    // 3. Hash password with bcrypt
    const password_hash = await hashPassword(data.password);
    const newClient = await clientAuthRepository.register({
      ...data,
      email: normalizedEmail,
      password_hash,
    });

    // 4. Mark verified OTP record as consumed so it cannot be reused
    await emailOtpRepository.markConsumed(verifiedRecord.id);
    await query('UPDATE clients SET email_verified_at = CURRENT_TIMESTAMP WHERE id = $1', [newClient.id]);

    const token = generateClientToken({
      id: newClient.id,
      email: newClient.email,
      status: newClient.status,
    });

    // Send welcome email asynchronously
    resendClient.sendWelcomeEmail(newClient.email, `${newClient.first_name} ${newClient.last_name}`).catch(() => {});

    const { password_hash: _, ...safeClient } = newClient;
    return { token, client: safeClient };
  }

  async login(email: string, password: string): Promise<{ token: string; client: Omit<ClientUser, 'password_hash'> }> {
    const client = await clientAuthRepository.findByEmail(email);
    if (!client || !client.password_hash) {
      throw new AppError(
        'Invalid email or password credentials.',
        401,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    if (client.status === 'suspended') {
      throw new AppError(
        'Your account is currently suspended. Please contact community management.',
        403,
        ERROR_CODES.FORBIDDEN
      );
    }

    const isMatch = await comparePassword(password, client.password_hash);
    if (!isMatch) {
      throw new AppError(
        'Invalid email or password credentials.',
        401,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const token = generateClientToken({
      id: client.id,
      email: client.email,
      status: client.status,
    });

    const { password_hash: _, ...safeClient } = client;
    return { token, client: safeClient };
  }

  async getMe(clientId: string): Promise<Omit<ClientUser, 'password_hash'>> {
    const client = await clientAuthRepository.findById(clientId);
    if (!client) {
      throw new AppError('Client profile not found.', 404, ERROR_CODES.NOT_FOUND);
    }
    const { password_hash: _, ...safeClient } = client;
    return safeClient;
  }
}

export const clientAuthService = new ClientAuthService();
