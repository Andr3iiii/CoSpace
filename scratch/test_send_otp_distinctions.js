require('dotenv').config();
const { Pool } = require('pg');

const API_BASE = 'http://localhost:3001';

async function testSendOtpDistinctions() {
  console.log('🧪 Testing send-otp Status Code Distinctions & Transactional Invalidation...\n');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const testEmail = `distinction.test.${Date.now()}@gmail.com`;

    // 1. First send: Should succeed with 200 OK
    console.log('1. First send-otp for new email...');
    const res1 = await fetch(`${API_BASE}/api/client/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const data1 = await res1.json();
    console.log('Status:', res1.status, 'Response:', data1);
    if (res1.status !== 200) throw new Error(`Expected 200, got ${res1.status}`);

    const initialRecord = (await pool.query(
      'SELECT id, is_invalidated FROM email_verification_otps WHERE LOWER(email) = LOWER($1)',
      [testEmail]
    )).rows[0];
    console.log('Initial OTP Record:', initialRecord);

    // 2. Immediate second send: Must hit 60s cooldown and return 429 (NOT 409!)
    console.log('\n2. Immediate second send-otp within 60s cooldown...');
    const res2 = await fetch(`${API_BASE}/api/client/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const data2 = await res2.json();
    console.log('Status:', res2.status, 'Response:', data2);
    if (res2.status !== 429) throw new Error(`Expected 429 for cooldown, got ${res2.status}`);
    if (res2.status === 409) throw new Error('BUG DETECTED: Cooldown returned 409 Conflict instead of 429!');

    // 3. Send after cooldown has elapsed with an existing active OTP:
    // Must NOT return 409 Conflict! Must safely invalidate previous OTP and issue new one with 200 OK
    console.log('\n3. Fast-forwarding 65s so cooldown is elapsed, then requesting new OTP...');
    await pool.query(
      'UPDATE email_verification_otps SET last_sent_at = NOW() - INTERVAL \'65 seconds\' WHERE id = $1',
      [initialRecord.id]
    );

    const res3 = await fetch(`${API_BASE}/api/client/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const data3 = await res3.json();
    console.log('Status:', res3.status, 'Response:', data3);
    if (res3.status !== 200) throw new Error(`Expected 200 OK after cooldown, got ${res3.status}`);

    // Check DB: Initial record must now be is_invalidated = true, and a new record created
    const records = (await pool.query(
      'SELECT id, is_invalidated, invalidated_reason FROM email_verification_otps WHERE LOWER(email) = LOWER($1) ORDER BY created_at ASC',
      [testEmail]
    )).rows;
    console.log('All OTP records for email:', records);
    if (records.length !== 2) throw new Error(`Expected 2 records, found ${records.length}`);
    if (!records[0].is_invalidated) throw new Error('Previous OTP was not invalidated!');
    if (records[1].is_invalidated) throw new Error('New OTP should be active, not invalidated!');
    console.log('✓ Verified: Previous active OTP was safely invalidated inside transaction and replaced with new active OTP!');

    // 4. Test registered email in clients table: Must return 409 Conflict
    console.log('\n4. Testing already-registered email in clients table...');
    const registeredClient = (await pool.query('SELECT email FROM clients WHERE email LIKE \'%@gmail.com\' LIMIT 1')).rows[0];
    if (registeredClient) {
      const res4 = await fetch(`${API_BASE}/api/client/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredClient.email }),
      });
      const data4 = await res4.json();
      console.log('Status:', res4.status, 'Response:', data4);
      if (res4.status !== 409) throw new Error(`Expected 409 for already registered user, got ${res4.status}`);
      console.log('✓ Verified: Already registered account returns 409 Conflict with message:', data4.message);
    }

    // Clean up test email
    await pool.query('DELETE FROM email_verification_otps WHERE LOWER(email) = LOWER($1)', [testEmail]);
    console.log('\n🎉 ALL STATUS CODE DISTINCTIONS & TRANSACTIONAL INVALIDATION VERIFIED SUCCESSFULLY!');
  } finally {
    await pool.end();
  }
}

testSendOtpDistinctions().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
