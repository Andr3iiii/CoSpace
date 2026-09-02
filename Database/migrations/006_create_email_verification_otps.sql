-- ============================================================================
-- Migration 006: Dedicated Email Verification OTPs Table & Rate Limits
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_verification_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    is_invalidated BOOLEAN NOT NULL DEFAULT FALSE,
    invalidated_reason VARCHAR(100),
    verification_token VARCHAR(255),
    token_expires_at TIMESTAMPTZ,
    is_consumed BOOLEAN NOT NULL DEFAULT FALSE,
    consumed_at TIMESTAMPTZ,
    last_sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-performance lookup and token validation
CREATE INDEX IF NOT EXISTS idx_email_otp_lookup 
ON public.email_verification_otps(email, is_verified, is_invalidated, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_otp_token 
ON public.email_verification_otps(verification_token);

CREATE INDEX IF NOT EXISTS idx_email_otp_rate_window 
ON public.email_verification_otps(email, created_at DESC);
