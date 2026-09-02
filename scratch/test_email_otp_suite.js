require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const API_BASE = 'http://localhost:3001';

async function runTestSuite() {
  console.log('🧪 Starting Comprehensive CoSpace Email OTP Verification Test Suite...\n');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // ------------------------------------------------------------------------
    // SCENARIO 1: Happy Path — Successful Verification & Status 200
    // ------------------------------------------------------------------------
    console.log('--- SCENARIO 1: Happy Path — Valid OTP Verification ---');
    const testEmail1 = `otp.test.success.${Date.now()}@gmail.com`;

    // 1a. Send OTP
    const sendRes1 = await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail1 }),
    });
    const sendData1 = await sendRes1.json();
    console.log('1a. send-otp status:', sendRes1.status, 'Response:', sendData1);
    if (sendRes1.status !== 200 || !sendData1.success) {
      throw new Error(`send-otp failed with status ${sendRes1.status}`);
    }

    // Retrieve the active OTP record from email_verification_otps
    const otpRecord1 = (await pool.query(
      'SELECT * FROM public.email_verification_otps WHERE LOWER(email) = LOWER($1) ORDER BY created_at DESC LIMIT 1',
      [testEmail1]
    )).rows[0];

    console.log('1b. Created OTP record:', {
      id: otpRecord1.id,
      expires_at: otpRecord1.expires_at,
      attempts: otpRecord1.attempts,
      max_attempts: otpRecord1.max_attempts,
      is_verified: otpRecord1.is_verified,
    });

    // Check that expires_at is roughly 10 minutes in the future (~600s)
    const expiryDiffSecs = (new Date(otpRecord1.expires_at).getTime() - new Date(otpRecord1.created_at).getTime()) / 1000;
    console.log(`1c. Validity duration: ${expiryDiffSecs} seconds (Expected ~600 seconds)`);
    if (Math.abs(expiryDiffSecs - 600) > 5) {
      throw new Error(`Expected OTP validity of 600 seconds (10 mins), got ${expiryDiffSecs}`);
    }

    // For testing verification, we update the record with a known hashed OTP "789456"
    const knownOtp = '789456';
    const knownHash = await bcrypt.hash(knownOtp, 10);
    await pool.query('UPDATE public.email_verification_otps SET otp_hash = $1 WHERE id = $2', [knownHash, otpRecord1.id]);

    // Verify using POST /api/auth/verify-otp
    const verifyRes1 = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail1, otp: knownOtp }),
    });
    const verifyData1 = await verifyRes1.json();
    console.log('1d. verify-otp status:', verifyRes1.status, 'Response:', verifyData1);
    if (verifyRes1.status !== 200 || verifyData1.verified !== true || !verifyData1.verificationToken) {
      throw new Error(`Expected 200 OK with verified: true and token, got ${verifyRes1.status}`);
    }

    // Verify DB state
    const verifiedRecord1 = (await pool.query('SELECT * FROM public.email_verification_otps WHERE id = $1', [otpRecord1.id])).rows[0];
    if (!verifiedRecord1.is_verified || !verifiedRecord1.verified_at || !verifiedRecord1.is_invalidated) {
      throw new Error('Database record state was not properly updated to verified & invalidated');
    }
    console.log('✓ Scenario 1 PASSED: OTP verified, token issued, OTP invalidated from reuse.\n');

    // ------------------------------------------------------------------------
    // SCENARIO 2: Incorrect OTP — Status 401 & Atomic Attempts Increment
    // ------------------------------------------------------------------------
    console.log('--- SCENARIO 2: Incorrect OTP — Status 401 & Atomic Increment ---');
    const testEmail2 = `otp.test.incorrect.${Date.now()}@gmail.com`;
    await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail2 }),
    });

    const otpRecord2 = (await pool.query(
      'SELECT id FROM public.email_verification_otps WHERE LOWER(email) = LOWER($1) ORDER BY created_at DESC LIMIT 1',
      [testEmail2]
    )).rows[0];
    await pool.query('UPDATE public.email_verification_otps SET otp_hash = $1 WHERE id = $2', [knownHash, otpRecord2.id]);

    // Send incorrect OTP
    const wrongRes2 = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail2, otp: '111111' }),
    });
    const wrongData2 = await wrongRes2.json();
    console.log('2a. Incorrect OTP status:', wrongRes2.status, 'Message:', wrongData2.message);
    if (wrongRes2.status !== 401) {
      throw new Error(`Expected HTTP 401 for incorrect OTP, got ${wrongRes2.status}`);
    }
    // Verify attempt incremented in DB
    const rec2After = (await pool.query('SELECT attempts, otp_hash FROM public.email_verification_otps WHERE id = $1', [otpRecord2.id])).rows[0];
    if (rec2After.attempts !== 1) {
      throw new Error(`Expected attempts = 1, got ${rec2After.attempts}`);
    }
    // Verify sensitive hash is not leaked in response
    if (JSON.stringify(wrongData2).includes(rec2After.otp_hash)) {
      throw new Error('SECURITY VIOLATION: Stored hash was leaked in API response!');
    }
    console.log('✓ Scenario 2 PASSED: HTTP 401 returned, attempts incremented to 1, hash kept confidential.\n');

    // ------------------------------------------------------------------------
    // SCENARIO 3: Maximum Attempts Exceeded — Status 429 & Lockout
    // ------------------------------------------------------------------------
    console.log('--- SCENARIO 3: Maximum 5 Attempts Exceeded — Status 429 & Invalidation ---');
    // We already failed 1 time. Let's send 4 more failed attempts
    for (let i = 2; i <= 5; i++) {
      const failRes = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail2, otp: '000000' }),
      });
      const failData = await failRes.json();
      console.log(`3.${i} Attempt ${i}/5 status:`, failRes.status, 'Message:', failData.message);
      if (i === 5) {
        if (failRes.status !== 429) {
          throw new Error(`Expected HTTP 429 on 5th failed attempt, got ${failRes.status}`);
        }
      }
    }

    // Now attempt #6 even with CORRECT OTP must be rejected with 429
    const lockoutRes = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail2, otp: knownOtp }),
    });
    console.log('3.6 Subsequent attempt with correct OTP status:', lockoutRes.status);
    if (lockoutRes.status !== 429 && lockoutRes.status !== 400) {
      throw new Error(`Expected 429/400 lockout on subsequent attempt, got ${lockoutRes.status}`);
    }
    console.log('✓ Scenario 3 PASSED: Locked out after 5 attempts, HTTP 429 enforced.\n');

    // ------------------------------------------------------------------------
    // SCENARIO 4: Expired OTP — Status 410 Gone
    // ------------------------------------------------------------------------
    console.log('--- SCENARIO 4: Expired OTP (> 10 mins) — Status 410 Gone ---');
    const testEmail4 = `otp.test.expired.${Date.now()}@gmail.com`;
    await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail4 }),
    });

    const otpRecord4 = (await pool.query(
      'SELECT id FROM public.email_verification_otps WHERE LOWER(email) = LOWER($1) ORDER BY created_at DESC LIMIT 1',
      [testEmail4]
    )).rows[0];
    await pool.query(
      'UPDATE public.email_verification_otps SET otp_hash = $1, expires_at = NOW() - INTERVAL \'1 minute\' WHERE id = $2',
      [knownHash, otpRecord4.id]
    );

    const expiredRes = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail4, otp: knownOtp }),
    });
    const expiredData = await expiredRes.json();
    console.log('4a. Expired OTP response status:', expiredRes.status, 'Message:', expiredData.message);
    if (expiredRes.status !== 410) {
      throw new Error(`Expected HTTP 410 Gone for expired OTP, got ${expiredRes.status}`);
    }
    console.log('✓ Scenario 4 PASSED: HTTP 410 returned for expired OTP.\n');

    // ------------------------------------------------------------------------
    // SCENARIO 5: Reused OTP — Status 400 Bad Request
    // ------------------------------------------------------------------------
    console.log('--- SCENARIO 5: Reused OTP Rejection ---');
    // Using testEmail1 which was verified in Scenario 1
    const reuseRes = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail1, otp: knownOtp }),
    });
    const reuseData = await reuseRes.json();
    console.log('5a. Reused OTP status:', reuseRes.status, 'Message:', reuseData.message);
    if (reuseRes.status !== 400) {
      throw new Error(`Expected HTTP 400 for reused OTP, got ${reuseRes.status}`);
    }
    console.log('✓ Scenario 5 PASSED: Reused OTP rejected with HTTP 400.\n');

    // ------------------------------------------------------------------------
    // SCENARIO 6: Missing / Nonexistent Active OTP — Status 400
    // ------------------------------------------------------------------------
    console.log('--- SCENARIO 6: Missing Active OTP Request ---');
    const missingRes = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'never.requested.otp@gmail.com', otp: '123456' }),
    });
    console.log('6a. Missing active OTP status:', missingRes.status);
    if (missingRes.status !== 400) {
      throw new Error(`Expected HTTP 400 for missing OTP, got ${missingRes.status}`);
    }
    console.log('✓ Scenario 6 PASSED: Missing OTP rejected with HTTP 400.\n');

    // ------------------------------------------------------------------------
    // SCENARIO 7: Concurrency & Race Condition Prevention
    // ------------------------------------------------------------------------
    console.log('--- SCENARIO 7: Concurrency & Double-Verification Prevention ---');
    const testEmail7 = `otp.test.concurrency.${Date.now()}@gmail.com`;
    await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail7 }),
    });

    const otpRecord7 = (await pool.query(
      'SELECT id FROM public.email_verification_otps WHERE LOWER(email) = LOWER($1) ORDER BY created_at DESC LIMIT 1',
      [testEmail7]
    )).rows[0];
    await pool.query('UPDATE public.email_verification_otps SET otp_hash = $1 WHERE id = $2', [knownHash, otpRecord7.id]);

    // Dispatch 5 simultaneous verify-otp requests
    const concurrentPromises = [1, 2, 3, 4, 5].map(() =>
      fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail7, otp: knownOtp }),
      }).then((r) => r.status)
    );

    const concurrentStatuses = await Promise.all(concurrentPromises);
    console.log('7a. Concurrent verification status codes:', concurrentStatuses);
    const successCount = concurrentStatuses.filter((s) => s === 200).length;
    console.log(`7b. Exact successful verifications: ${successCount} (Must be exactly 1)`);
    if (successCount !== 1) {
      throw new Error(`Race condition detected! Expected exactly 1 success, got ${successCount}`);
    }
    console.log('✓ Scenario 7 PASSED: Row-level lock serialized requests; exactly 1 verified.\n');

    // ------------------------------------------------------------------------
    // SCENARIO 8: Registration Guard Integration
    // ------------------------------------------------------------------------
    console.log('--- SCENARIO 8: Registration Guard Integration ---');
    const unverifiedEmail = `unverified.client.${Date.now()}@gmail.com`;

    // 8a. Attempt registration without OTP verification
    const unverifiedRegRes = await fetch(`${API_BASE}/api/client/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: unverifiedEmail,
        password: 'Password123!',
        firstName: 'Unverified',
        lastName: 'User',
      }),
    });
    console.log('8a. Registration without OTP status:', unverifiedRegRes.status);
    if (unverifiedRegRes.status !== 400) {
      throw new Error(`Expected HTTP 400 when registering without OTP, got ${unverifiedRegRes.status}`);
    }

    // 8b. Now complete OTP verification for a new user
    const verifiedEmail = `verified.client.${Date.now()}@gmail.com`;
    await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: verifiedEmail }),
    });

    const otpRecord8 = (await pool.query(
      'SELECT id FROM public.email_verification_otps WHERE LOWER(email) = LOWER($1) ORDER BY created_at DESC LIMIT 1',
      [verifiedEmail]
    )).rows[0];
    await pool.query('UPDATE public.email_verification_otps SET otp_hash = $1 WHERE id = $2', [knownHash, otpRecord8.id]);

    const verifyRes8 = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: verifiedEmail, otp: knownOtp }),
    });
    const verifyData8 = await verifyRes8.json();
    const token8 = verifyData8.verificationToken;

    // 8c. Register with verified email and token
    const validRegRes = await fetch(`${API_BASE}/api/client/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: verifiedEmail,
        password: 'Password123!',
        firstName: 'Verified',
        lastName: 'User',
        verificationToken: token8,
      }),
    });
    const validRegData = await validRegRes.json();
    console.log('8c. Registration with verified OTP status:', validRegRes.status, 'Client ID:', validRegData.data?.client?.id);
    if (validRegRes.status !== 201) {
      throw new Error(`Expected HTTP 201 for valid registration, got ${validRegRes.status}`);
    }

    // Check consumed state
    const consumedRecord = (await pool.query('SELECT is_consumed, consumed_at FROM public.email_verification_otps WHERE id = $1', [otpRecord8.id])).rows[0];
    if (!consumedRecord.is_consumed || !consumedRecord.consumed_at) {
      throw new Error('OTP verification record was not marked consumed upon registration');
    }

    // 8d. Attempt to register again with same consumed token
    const reRegRes = await fetch(`${API_BASE}/api/client/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: verifiedEmail,
        password: 'Password123!',
        firstName: 'Duplicate',
        lastName: 'User',
        verificationToken: token8,
      }),
    });
    console.log('8d. Attempting registration with consumed token status:', reRegRes.status);
    if (reRegRes.status === 201) {
      throw new Error('SECURITY VIOLATION: Consumed verification token was reused!');
    }
    console.log('✓ Scenario 8 PASSED: Registration strictly guards on unconsumed verified OTP state.\n');

    // ------------------------------------------------------------------------
    // SCENARIO 9: Rate Limits — 60s Resend Cooldown & Max 5 Sends / 15 Mins
    // ------------------------------------------------------------------------
    console.log('--- SCENARIO 9: Rate Limiting (60s Cooldown & 5 Sends / 15 Mins) ---');
    const rateEmail = `otp.rate.${Date.now()}@gmail.com`;

    // Send 1
    const r1 = await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: rateEmail }),
    });
    console.log('9a. Send #1 status:', r1.status);

    // Immediate second send -> Must hit 60s cooldown (429)
    const r2 = await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: rateEmail }),
    });
    console.log('9b. Send #2 immediate (should be 429):', r2.status);
    if (r2.status !== 429) {
      throw new Error(`Expected HTTP 429 for 60s cooldown violation, got ${r2.status}`);
    }

    // Fast-forward last_sent_at and send 4 more times (reaching total 5)
    for (let s = 2; s <= 5; s++) {
      await pool.query('UPDATE public.email_verification_otps SET last_sent_at = NOW() - INTERVAL \'65 seconds\' WHERE LOWER(email) = LOWER($1)', [rateEmail]);
      const rs = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: rateEmail }),
      });
      console.log(`9c. Send #${s} status:`, rs.status);
      if (rs.status !== 200) {
        throw new Error(`Expected HTTP 200 for send #${s}, got ${rs.status}`);
      }
    }

    // Now try 6th send in the 15-minute window -> Must hit 429
    await pool.query('UPDATE public.email_verification_otps SET last_sent_at = NOW() - INTERVAL \'65 seconds\' WHERE LOWER(email) = LOWER($1)', [rateEmail]);
    const r6 = await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: rateEmail }),
    });
    console.log('9d. Send #6 (15-min limit, should be 429):', r6.status);
    if (r6.status !== 429) {
      throw new Error(`Expected HTTP 429 for 15-minute rate limit, got ${r6.status}`);
    }
    console.log('✓ Scenario 9 PASSED: Both 60s cooldown and 5 sends / 15 mins rate limits enforced.\n');

    // Clean up test data
    await pool.query('DELETE FROM clients WHERE email IN ($1, $2, $3, $4, $5, $6)', [
      testEmail1,
      testEmail2,
      testEmail4,
      testEmail7,
      verifiedEmail,
      rateEmail,
    ]);
    await pool.query('DELETE FROM public.email_verification_otps WHERE email IN ($1, $2, $3, $4, $5, $6)', [
      testEmail1,
      testEmail2,
      testEmail4,
      testEmail7,
      verifiedEmail,
      rateEmail,
    ]);

    console.log('🎉 ALL 9 EMAIL OTP VERIFICATION SCENARIOS PASSED WITH FLYING COLORS!');
  } finally {
    await pool.end();
  }
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
