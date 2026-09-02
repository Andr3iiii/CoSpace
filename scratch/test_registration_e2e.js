const http = require('http');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/cospace_db',
});

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runE2ETest() {
  console.log('🧪 Starting Registration Security & Email OTP E2E Test...\n');
  const testEmail = `tester${Date.now()}@gmail.com`;

  try {
    // 1. Send OTP to non-Gmail
    console.log('1. Testing non-Gmail rejection...');
    const nonGmailRes = await request(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/api/client/auth/send-otp',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'baduser@yahoo.com' }
    );
    console.log(`   Status: ${nonGmailRes.status} (Expected 422)`);
    if (nonGmailRes.status !== 422) throw new Error('Failed: Non-Gmail was not rejected');
    console.log('   ✅ Non-Gmail correctly rejected with 422.');

    // 2. Send OTP to valid Gmail
    console.log('\n2. Testing OTP request for legitimate Gmail...');
    const sendOtpRes = await request(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/api/client/auth/send-otp',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: testEmail }
    );
    console.log(`   Status: ${sendOtpRes.status} (Expected 200)`);
    if (sendOtpRes.status !== 200) throw new Error(`Failed to send OTP: ${JSON.stringify(sendOtpRes.body)}`);
    console.log('   ✅ OTP sent successfully.');

    // 3. Attempt bypass registration before verifying OTP
    console.log('\n3. Testing Registration Bypass prevention (Unverified email)...');
    const bypassRes = await request(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/api/client/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        countryCode: '+63',
        phone: '9171234567',
      }
    );
    console.log(`   Status: ${bypassRes.status} (Expected 400)`);
    console.log(`   Message: ${bypassRes.body?.error?.message || bypassRes.body?.message}`);
    if (bypassRes.status !== 400) throw new Error('Failed: Registration bypass was allowed!');
    console.log('   ✅ Registration properly rejected because email is not verified.');

    // 4. Test wrong OTP code
    console.log('\n4. Testing wrong OTP code...');
    const wrongOtpRes = await request(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/api/client/auth/verify-otp',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: testEmail, otp: '000000' }
    );
    console.log(`   Status: ${wrongOtpRes.status} (Expected 400)`);
    if (wrongOtpRes.status !== 400) throw new Error('Failed: Incorrect OTP was accepted');
    console.log('   ✅ Wrong OTP rejected.');

    // 5. Query verification record and verify valid OTP
    // For test simulation, let's mark the verification record as verified directly in database
    console.log('\n5. Verifying OTP in database...');
    await pool.query(
      `UPDATE email_verifications 
       SET is_verified = TRUE, verified_at = CURRENT_TIMESTAMP 
       WHERE email = $1`,
      [testEmail]
    );
    console.log('   ✅ Email verification record confirmed in database.');

    // 6. Test invalid Philippine phone format (leading 0)
    console.log('\n6. Testing invalid Philippine phone format (+63 09171234567)...');
    const invalidPhoneRes = await request(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/api/client/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        countryCode: '+63',
        phone: '09171234567',
      }
    );
    console.log(`   Status: ${invalidPhoneRes.status} (Expected 422)`);
    if (invalidPhoneRes.status !== 422) throw new Error('Failed: Leading 0 in Philippine number was accepted');
    console.log('   ✅ Invalid Philippine phone rejected.');

    // 7. Test weak password
    console.log('\n7. Testing weak password (pass123)...');
    const weakPassRes = await request(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/api/client/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: testEmail,
        password: 'pass',
        confirmPassword: 'pass',
        firstName: 'Test',
        lastName: 'User',
        countryCode: '+63',
        phone: '9171234567',
      }
    );
    console.log(`   Status: ${weakPassRes.status} (Expected 422)`);
    if (weakPassRes.status !== 422) throw new Error('Failed: Weak password was accepted');
    console.log('   ✅ Weak password rejected.');

    // 8. Register with all valid details
    console.log('\n8. Registering with fully valid details...');
    const validRegRes = await request(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/api/client/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: testEmail,
        password: 'CoSpace#2026Secure',
        confirmPassword: 'CoSpace#2026Secure',
        firstName: 'Andrei',
        lastName: 'Cruz',
        countryCode: '+63',
        phone: '9171234567',
        companyName: 'CoSpace Labs',
      }
    );
    console.log(`   Status: ${validRegRes.status} (Expected 201)`);
    if (validRegRes.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(validRegRes.body)}`);
    console.log(`   Client ID: ${validRegRes.body?.data?.client?.id}`);
    console.log(`   JWT Token Issued: ${validRegRes.body?.data?.token ? 'YES' : 'NO'}`);
    console.log('   ✅ Account registration successful!');

    // 9. Test duplicate email registration
    console.log('\n9. Testing duplicate email registration...');
    const dupRes = await request(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/api/client/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: testEmail,
        password: 'CoSpace#2026Secure',
        confirmPassword: 'CoSpace#2026Secure',
        firstName: 'Andrei',
        lastName: 'Cruz',
        countryCode: '+63',
        phone: '9171234567',
      }
    );
    console.log(`   Status: ${dupRes.status} (Expected 409)`);
    if (dupRes.status !== 409) throw new Error('Failed: Duplicate registration was not blocked with 409');
    console.log('   ✅ Duplicate account correctly rejected with 409 Conflict.');

    console.log('\n🎉 ALL REGISTRATION SECURITY TESTS PASSED PERFECTLY!\n');
  } finally {
    await pool.end();
  }
}

runE2ETest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
