import { query } from '../database/connection';
import { EmailVerification } from '../types';

export class EmailVerificationRepository {
  /**
   * Invalidate any prior pending unverified OTP requests for this email
   */
  async invalidatePrior(email: string): Promise<void> {
    await query(
      `UPDATE email_verifications 
       SET expires_at = CURRENT_TIMESTAMP 
       WHERE email = $1 AND is_verified = FALSE AND expires_at > CURRENT_TIMESTAMP`,
      [email.toLowerCase().trim()]
    );
  }

  /**
   * Create a new OTP verification record
   */
  async createVerification(
    email: string,
    otpHash: string,
    expiresAt: Date
  ): Promise<EmailVerification> {
    const rows = await query<EmailVerification>(
      `INSERT INTO email_verifications (email, otp_hash, expires_at, attempts, is_verified, last_sent_at)
       VALUES ($1, $2, $3, 0, FALSE, CURRENT_TIMESTAMP)
       RETURNING id, email, otp_hash, expires_at, attempts, max_attempts, is_verified, verified_at, last_sent_at, created_at`,
      [email.toLowerCase().trim(), otpHash, expiresAt]
    );
    return rows[0];
  }

  /**
   * Find the most recent active OTP record for an email
   */
  async findLatestByEmail(email: string): Promise<EmailVerification | null> {
    const rows = await query<EmailVerification>(
      `SELECT id, email, otp_hash, expires_at, attempts, max_attempts, is_verified, verified_at, last_sent_at, created_at
       FROM email_verifications
       WHERE email = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  }

  /**
   * Increment failed attempt count
   */
  async incrementAttempts(id: string): Promise<number> {
    const rows = await query<{ attempts: number }>(
      `UPDATE email_verifications
       SET attempts = attempts + 1
       WHERE id = $1
       RETURNING attempts`,
      [id]
    );
    return rows[0]?.attempts || 0;
  }

  /**
   * Mark record as verified
   */
  async markVerified(id: string): Promise<void> {
    await query(
      `UPDATE email_verifications
       SET is_verified = TRUE, verified_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );
  }

  /**
   * Check if an email has completed valid OTP verification within the given window (default 15 mins)
   */
  async findLatestVerified(email: string, withinMinutes = 15): Promise<EmailVerification | null> {
    const rows = await query<EmailVerification>(
      `SELECT id, email, otp_hash, expires_at, attempts, max_attempts, is_verified, verified_at, last_sent_at, created_at
       FROM email_verifications
       WHERE email = $1 
         AND is_verified = TRUE 
         AND verified_at >= NOW() - ($2 || ' minutes')::interval
       ORDER BY verified_at DESC
       LIMIT 1`,
      [email.toLowerCase().trim(), withinMinutes]
    );
    return rows[0] || null;
  }
}

export const emailVerificationRepository = new EmailVerificationRepository();
