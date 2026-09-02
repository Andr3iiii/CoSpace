const http = require('http');

const CLIENT_API = 'http://localhost:3001/api/client';
const ADMIN_API = 'http://localhost:3002/api/admin';

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const reqOptions = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runDefectAudit() {
  console.log('================================================================');
  console.log('🔍 COSPACE RIGOROUS UNBIASED QA DEFECT AUDIT');
  console.log('================================================================\n');

  const discoveredDefects = [];

  // Authenticate Client & Admin
  const clientAuth = await request(`${CLIENT_API}/auth/login`, { method: 'POST' }, {
    email: 'client@cospace.com',
    password: 'Client@123456',
  });
  const clientToken1 = clientAuth.data.data?.token;

  const clientAuth2 = await request(`${CLIENT_API}/auth/login`, { method: 'POST' }, {
    email: 'maria.santos@techflow.io',
    password: 'Client@123456',
  });
  const clientToken2 = clientAuth2.data.data?.token;

  const adminAuth = await request(`${ADMIN_API}/auth/login`, { method: 'POST' }, {
    email: 'admin@cospace.com',
    password: 'Admin@123456',
  });
  const adminToken = adminAuth.data.data?.token;

  const receptionAuth = await request(`${ADMIN_API}/auth/login`, { method: 'POST' }, {
    email: 'reception@cospace.com',
    password: 'Admin@123456',
  });
  const receptionistToken = receptionAuth.data.data?.token;

  const wsList = await request(`${CLIENT_API}/workspaces`);
  const workspace = wsList.data.data[0];

  // -------------------------------------------------------------
  // AUDIT 1: Reschedule Booking without Collision Check
  // -------------------------------------------------------------
  console.log('🔎 [TEST 1] Admin Reschedule Collision Check...');
  const dateSeed = 100 + Math.floor(Math.random() * 800);
  const start1 = new Date();
  start1.setDate(start1.getDate() + dateSeed);
  start1.setHours(9, 0, 0, 0);
  const end1 = new Date(start1);
  end1.setHours(13, 0, 0, 0);

  // Booking A: 09:00 - 13:00
  const b1Res = await request(`${CLIENT_API}/bookings`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken1}` },
  }, {
    workspaceId: workspace.id,
    startTime: start1.toISOString(),
    endTime: end1.toISOString(),
  });
  const bookingA = b1Res.data.data;

  // Booking B: 14:00 - 18:00
  const start2 = new Date(start1);
  start2.setHours(14, 0, 0, 0);
  const end2 = new Date(start1);
  end2.setHours(18, 0, 0, 0);

  const b2Res = await request(`${CLIENT_API}/bookings`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken2}` },
  }, {
    workspaceId: workspace.id,
    startTime: start2.toISOString(),
    endTime: end2.toISOString(),
  });
  const bookingB = b2Res.data.data;

  // Attempt to reschedule Booking B directly on top of Booking A (09:00 - 13:00)
  const rescheduleRes = await request(`${ADMIN_API}/bookings/${bookingB.id}/reschedule`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
  }, {
    startTime: start1.toISOString(),
    endTime: end1.toISOString(),
  });

  if (rescheduleRes.status === 200) {
    console.error('❌ DEFECT FOUND: Admin rescheduled booking into an already reserved slot without collision check!');
    discoveredDefects.push({
      title: 'Admin Reschedule Endpoint Lacks Overlap / Collision Validation',
      severity: 'HIGH',
      feature: 'Admin Booking Management',
      tier: 'Backend & Database',
      steps: [
        'Create Booking A for Slot X (09:00-13:00).',
        'Create Booking B for Slot Y (14:00-18:00).',
        'Call PATCH /api/admin/bookings/:id/reschedule to move Booking B into Slot X.',
      ],
      expected: 'HTTP 409 Conflict with collision rejection.',
      actual: 'HTTP 200 OK — Overwrite succeeds, creating double-booked slot in physical inventory.',
      rootCause: 'adminBooking.repository.ts rescheduleBooking executes direct UPDATE without checking fn_check_workspace_availability.',
      risk: 'High risk of double-booking desks/rooms during admin rescheduling.',
    });
  } else {
    console.log('✅ PASS: Reschedule collision blocked with status:', rescheduleRes.status);
  }

  // -------------------------------------------------------------
  // AUDIT 2: Payment Intent creation on Cancelled Booking
  // -------------------------------------------------------------
  console.log('\n🔎 [TEST 2] Payment Intent on Cancelled Booking...');
  // Cancel Booking A
  await request(`${CLIENT_API}/bookings/${bookingA.id}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken1}` },
  }, { reason: 'Testing cancellation' });

  // Attempt to create payment intent for cancelled booking
  const intentRes = await request(`${CLIENT_API}/payments/create-intent`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken1}` },
  }, {
    bookingId: bookingA.id,
    paymentMethodType: 'card',
  });

  if (intentRes.status === 200 || intentRes.status === 201) {
    console.error('❌ DEFECT FOUND: Payment intent created for a cancelled booking!');
    discoveredDefects.push({
      title: 'Payment Intent Permitted on Cancelled or Expired Bookings',
      severity: 'MEDIUM',
      feature: 'Payment Processing',
      tier: 'Backend Service',
      steps: [
        'Create a reservation in Pending status.',
        'Cancel the reservation (Status becomes Cancelled).',
        'Call POST /api/client/payments/create-intent with the cancelled booking ID.',
      ],
      expected: 'HTTP 400/422 Bad Request rejecting payment on cancelled booking.',
      actual: 'HTTP 200 OK — Payment intent created and charged for inactive reservation.',
      rootCause: 'clientPayment.service.ts only checks `if (booking.status === "confirmed")` rather than `if (booking.status !== "pending")`.',
      risk: 'Clients may get charged for cancelled slots, requiring manual refunds.',
    });
  } else {
    console.log('✅ PASS: Payment intent on cancelled booking correctly rejected with status:', intentRes.status);
  }

  // -------------------------------------------------------------
  // AUDIT 3: IDOR in Payment Confirmation
  // -------------------------------------------------------------
  console.log('\n🔎 [TEST 3] IDOR Vulnerability in Payment Confirmation...');
  // Create pending booking for Client 1
  const start3 = new Date();
  start3.setDate(start3.getDate() + dateSeed + 2);
  start3.setHours(10, 0, 0, 0);
  const end3 = new Date(start3);
  end3.setHours(12, 0, 0, 0);

  const b3Res = await request(`${CLIENT_API}/bookings`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken1}` },
  }, {
    workspaceId: workspace.id,
    startTime: start3.toISOString(),
    endTime: end3.toISOString(),
  });
  const bookingC = b3Res.data.data;

  // Client 1 creates intent
  const pmtRes = await request(`${CLIENT_API}/payments/create-intent`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken1}` },
  }, {
    bookingId: bookingC.id,
    paymentMethodType: 'gcash',
  });
  const paymentId = pmtRes.data.data?.payment?.id;

  // Client 2 attempts to confirm Client 1's payment
  const idorConfirmRes = await request(`${CLIENT_API}/payments/confirm`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken2}` },
  }, {
    paymentId,
  });

  if (idorConfirmRes.status === 200) {
    console.error('❌ DEFECT FOUND: IDOR in payment confirmation! Client 2 was able to confirm Client 1 payment!');
    discoveredDefects.push({
      title: 'IDOR in Payment Confirmation Endpoint (/api/client/payments/confirm)',
      severity: 'HIGH',
      feature: 'Payment Authorization & Security',
      tier: 'Backend Controller & Repository',
      steps: [
        'Client 1 initiates payment for Booking A (generates Payment ID).',
        'Client 2 calls POST /api/client/payments/confirm supplying Client 1 Payment ID with Client 2 JWT token.',
      ],
      expected: 'HTTP 403 Forbidden or 404 Not Found (Payment does not belong to authenticated user).',
      actual: 'HTTP 200 OK — Payment successfully confirmed by unauthorized third-party user.',
      rootCause: 'clientPayment.controller.ts confirmPayment does not pass req.clientUser.id to clientPaymentRepository.confirmPaymentSuccess.',
      risk: 'Allows unauthorized clients to trigger payment completions on arbitrary member bookings.',
    });
  } else {
    console.log('✅ PASS: Cross-client payment confirmation rejected with status:', idorConfirmRes.status);
  }

  // -------------------------------------------------------------
  // AUDIT 4: Date Range Filter in Admin Reports
  // -------------------------------------------------------------
  console.log('\n🔎 [TEST 4] Admin Reports Date Filter Ignoring Parameters...');
  const reportAllRes = await request(`${ADMIN_API}/reports`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const reportNarrowRes = await request(`${ADMIN_API}/reports?startDate=2020-01-01&endDate=2020-01-02`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  if (
    reportAllRes.status === 200 &&
    reportNarrowRes.status === 200 &&
    reportAllRes.data.data.totalRevenue > 0 &&
    reportAllRes.data.data.totalRevenue === reportNarrowRes.data.data.totalRevenue
  ) {
    console.error('❌ DEFECT FOUND: Admin Reports endpoint ignores startDate and endDate query parameters!');
    discoveredDefects.push({
      title: 'Admin Financial Reports Ignores Date Filter Parameters (startDate & endDate)',
      severity: 'MEDIUM',
      feature: 'Admin Analytics & Financial Reporting',
      tier: 'Backend Repository',
      steps: [
        'Query GET /api/admin/reports (returns all-time revenue).',
        'Query GET /api/admin/reports?startDate=2020-01-01&endDate=2020-01-02 (a range with zero transactions).',
      ],
      expected: 'Total revenue and bookings reflect only the 2020 date interval (₱0).',
      actual: 'Returns the exact all-time lifetime revenue (₱' + reportAllRes.data.data.totalRevenue + ') regardless of date filter.',
      rootCause: 'report.repository.ts lines 17-22 execute SQL query without WHERE paid_at BETWEEN start AND end.',
      risk: 'Monthly and quarterly revenue reports displayed in admin dashboard are statistically inaccurate.',
    });
  } else {
    console.log('✅ PASS: Date filter accurately scoped report metrics.');
  }

  // -------------------------------------------------------------
  // AUDIT 5: RBAC Authorization on Workspace Mutation by Receptionist
  // -------------------------------------------------------------
  console.log('\n🔎 [TEST 5] RBAC Guarding on Workspace Status by Receptionist...');
  const rbacRes = await request(`${ADMIN_API}/workspaces/${workspace.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${receptionistToken}` },
  }, {
    status: 'maintenance',
  });

  if (rbacRes.status === 200) {
    console.error('❌ DEFECT FOUND: Receptionist role allowed to modify workspace operational status!');
    discoveredDefects.push({
      title: 'Missing RBAC Role Guard on Workspace Status Mutation Endpoint',
      severity: 'MEDIUM',
      feature: 'Admin RBAC & Inventory Control',
      tier: 'Backend Routes',
      steps: [
        'Log in with receptionist account (reception@cospace.com).',
        'Send PATCH /api/admin/workspaces/:id/status to change status to "maintenance".',
      ],
      expected: 'HTTP 403 Forbidden (Only Superadmin and Admin roles permitted).',
      actual: 'HTTP 200 OK — Workspace status updated by receptionist.',
      rootCause: 'workspace.routes.ts router.patch("/:id/status") lacks authorizeRoles("superadmin", "admin") middleware.',
      risk: 'Low-privilege staff can disable critical revenue-generating workspace inventory.',
    });
  } else {
    console.log('✅ PASS: Receptionist blocked with status:', rbacRes.status);
  }

  // -------------------------------------------------------------
  // AUDIT 6: Email Collision on Profile Update
  // -------------------------------------------------------------
  console.log('\n🔎 [TEST 6] Email Collision / Privilege Escalation in Profile...');
  const profileMutateRes = await request(`${CLIENT_API}/profile`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${clientToken1}` },
  }, {
    email: 'maria.santos@techflow.io',
    firstName: 'Hacked',
  });
  console.log('Profile update response:', profileMutateRes.status);

  // -------------------------------------------------------------
  // AUDIT SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 DEFECT AUDIT SUMMARY: ${discoveredDefects.length} DEFECTS FOUND`);
  console.log('================================================================');
  console.table(discoveredDefects.map(d => ({ Title: d.title, Severity: d.severity, Tier: d.tier })));

  return discoveredDefects;
}

runDefectAudit().catch((err) => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});
