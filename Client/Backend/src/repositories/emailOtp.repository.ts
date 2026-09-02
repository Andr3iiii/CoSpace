import { PoolClient } from 'pg';
import { query, getClient } from '../database/connection';
import { EmailVerificationOtp } from '../types';

export class EmailOtpRepository {
  /**
   * Counts the number of OTP creation/send requests for this email within the specified window (minutes).
   */
  async countSendsInWindow(email: string, windowMinutes = 15): Promise<number> {
    const rows = await query<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM public.email_verification_otps
       WHERE LOWER(email) = LOWER($1)
         AND created_at >= NOW() - ($2 || ' minutes')::interval`,
      [email.toLowerCase().trim(), windowMinutes]
    );
    return rows[0]?.count || 0;
  }

  /**
   * Retrieves the most recently created OTP record for an email (for cooldown calculations).
   */
  async getLatestByEmail(email: string): Promise<EmailVerificationOtp | null> {
    const rows = await query<EmailVerificationOtp>(
      `SELECT *
       FROM public.email_verification_otps
       WHERE LOWER(email) = LOWER($1)
       ORDER BY created_at DESC
       LIMIT 1`,
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  }

  /**
   * Retrieves the current active, unverified, non-invalidated OTP record inside a transaction
   * with FOR UPDATE row locking to serialize concurrent verification requests.
   */
  async getActiveForUpdate(client: PoolClient, email: string): Promise<EmailVerificationOtp | null> {
    const res = await client.query<EmailVerificationOtp>(
      `SELECT *
       FROM public.email_verification_otps
       WHERE LOWER(email) = LOWER($1)
         AND is_invalidated = FALSE
         AND is_verified = FALSE
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [email.toLowerCase().trim()]
    );
    return res.rows[0] || null;
  }

  /**
   * Invalidate prior pending unverified OTP requests for this email to enforce one active OTP per email.
   */
  async invalidatePrior(email: string, reason = 'Superseded by new OTP request'): Promise<void> {
    await query(
      `UPDATE public.email_verification_otps
       SET is_invalidated = TRUE, invalidated_reason = $2
       WHERE LOWER(email) = LOWER($1)
         AND is_invalidated = FALSE
         AND is_verified = FALSE`,
      [email.toLowerCase().trim(), reason]
    );
  }

  /**
   * Inserts a new OTP record into email_verification_otps.
   */
  async createOtp(
    email: string,
    otpHash: string,
    expiresAt: Date
  ): Promise<EmailVerificationOtp> {
    const rows = await query<EmailVerificationOtp>(
      `INSERT INTO public.email_verification_otps (
         email, otp_hash, expires_at, attempts, max_attempts, is_verified, is_invalidated, last_sent_at
       )
       VALUES ($1, $2, $3, 0, 5, FALSE, FALSE, CURRENT_TIMESTAMP)
       RETURNING *`,
      [email.toLowerCase().trim(), otpHash, expiresAt]
    );
    return rows[0];
  }

  /**
   * Safely invalidates any existing active unverified OTP for this email and inserts
   * the new active OTP inside a single database transaction, strictly enforcing one active OTP per email.
   */
  async createOtpWithInvalidation(
    email: string,
    otpHash: string,
    expiresAt: Date
  ): Promise<EmailVerificationOtp> {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Atomically invalidate prior active unverified OTPs inside this transaction
      await client.query(
        `UPDATE public.email_verification_otps
         SET is_invalidated = TRUE, invalidated_reason = 'Superseded by new OTP request'
         WHERE LOWER(email) = LOWER($1)
           AND is_invalidated = FALSE
           AND is_verified = FALSE`,
        [email.toLowerCase().trim()]
      );

      // Insert the new active OTP inside the same transaction
      const res = await client.query<EmailVerificationOtp>(
        `INSERT INTO public.email_verification_otps (
           email, otp_hash, expires_at, attempts, max_attempts, is_verified, is_invalidated, last_sent_at
         )
         VALUES ($1, $2, $3, 0, 5, FALSE, FALSE, CURRENT_TIMESTAMP)
         RETURNING *`,
        [email.toLowerCase().trim(), otpHash, expiresAt]
      );

      await client.query('COMMIT');
      return res.rows[0];
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Atomically increments the attempts counter inside a transaction.
   * If max attempts reached, automatically marks the record as invalidated.
   */
  async incrementAttempts(
    client: PoolClient,
    id: string,
    markInvalidated = false
  ): Promise<number> {
    const res = await client.query<{ attempts: number }>(
      `UPDATE public.email_verification_otps
       SET attempts = attempts + 1,
           is_invalidated = CASE WHEN $2::boolean = TRUE THEN TRUE ELSE is_invalidated END,
           invalidated_reason = CASE WHEN $2::boolean = TRUE THEN 'Maximum attempts exceeded' ELSE invalidated_reason END
       WHERE id = $1
       RETURNING attempts`,
      [id, markInvalidated]
    );
    return res.rows[0]?.attempts || 0;
  }

  /**
   * Invalidate an OTP record inside a transaction.
   */
  async invalidateRecord(client: PoolClient, id: string, reason: string): Promise<void> {
    await client.query(
      `UPDATE public.email_verification_otps
       SET is_invalidated = TRUE, invalidated_reason = $2
       WHERE id = $1`,
      [id, reason]
    );
  }

  /**
   * Marks record verified, stores a verification token, and invalidates the OTP from reuse.
   */
  async markVerified(
    client: PoolClient,
    id: string,
    verificationToken: string,
    tokenExpiresAt: Date
  ): Promise<EmailVerificationOtp> {
    const res = await client.query<EmailVerificationOtp>(
      `UPDATE public.email_verification_otps
       SET is_verified = TRUE,
           verified_at = CURRENT_TIMESTAMP,
           is_invalidated = TRUE,
           invalidated_reason = 'Verified successfully',
           verification_token = $2,
           token_expires_at = $3
       WHERE id = $1
       RETURNING *`,
      [id, verificationToken, tokenExpiresAt]
    );
    return res.rows[0];
  }

  /**
   * Checks if a valid, unconsumed verification exists for registration within given window (default 15 minutes).
   */
  async findValidVerified(
    email: string,
    token?: string,
    withinMinutes = 15
  ): Promise<EmailVerificationOtp | null> {
    const rows = await query<EmailVerificationOtp>(
      `SELECT *
       FROM public.email_verification_otps
       WHERE LOWER(email) = LOWER($1)
         AND is_verified = TRUE
         AND is_consumed = FALSE
         AND verified_at >= NOW() - ($2 || ' minutes')::interval
         AND ($3::varchar IS NULL OR verification_token = $3)
       ORDER BY verified_at DESC
       LIMIT 1`,
      [email.toLowerCase().trim(), withinMinutes, token || null]
    );
    return rows[0] || null;
  }

  /**
   * Marks a verified OTP state as consumed by registration so it cannot be reused.
   */
  async markConsumed(id: string): Promise<void> {
    await query(
      `UPDATE public.email_verification_otps
       SET is_consumed = TRUE, consumed_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );
  }
}

export const emailOtpRepository = new EmailOtpRepository();
