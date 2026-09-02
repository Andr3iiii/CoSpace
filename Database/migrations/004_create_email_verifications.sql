-- ============================================================================
-- Migration 004: Create Email Verifications Table & Security Columns
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    last_sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email 
ON email_verifications(email);

CREATE INDEX IF NOT EXISTS idx_email_verifications_lookup 
ON email_verifications(email, is_verified, created_at DESC);

-- Add email_verified_at to clients table if not already present
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
