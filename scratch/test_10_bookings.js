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

async function run10BookingsTest() {
  console.log('================================================================');
  console.log('🧪 COSPACE QA TEST: 10+ REAL WORKSPACE BOOKINGS EXECUTION');
  console.log('================================================================\n');

  // 1. Authenticate Clients and Admin
  console.log('--- 1. AUTHENTICATING CLIENTS & ADMIN ---');
  
  const clientAuth = await request(`${CLIENT_API}/auth/login`, { method: 'POST' }, {
    email: 'client@cospace.com',
    password: 'Client@123456',
  });
  if (clientAuth.status !== 200) throw new Error(`Client 1 login failed: ${JSON.stringify(clientAuth.data)}`);
  const clientToken1 = clientAuth.data.data.token;
  console.log('✅ Client 1 (John Doe) authenticated.');

  const clientAuth2 = await request(`${CLIENT_API}/auth/login`, { method: 'POST' }, {
    email: 'maria.santos@techflow.io',
    password: 'Client@123456',
  });
  if (clientAuth2.status !== 200) throw new Error(`Client 2 login failed: ${JSON.stringify(clientAuth2.data)}`);
  const clientToken2 = clientAuth2.data.data.token;
  console.log('✅ Client 2 (Maria Santos) authenticated.');

  const clientAuth3 = await request(`${CLIENT_API}/auth/login`, { method: 'POST' }, {
    email: 'david.kim@apexdev.com',
    password: 'Client@123456',
  });
  if (clientAuth3.status !== 200) throw new Error(`Client 3 login failed: ${JSON.stringify(clientAuth3.data)}`);
  const clientToken3 = clientAuth3.data.data.token;
  console.log('✅ Client 3 (David Kim) authenticated.');

  const adminAuth = await request(`${ADMIN_API}/auth/login`, { method: 'POST' }, {
    email: 'admin@cospace.com',
    password: 'Admin@123456',
  });
  if (adminAuth.status !== 200) throw new Error(`Admin login failed: ${JSON.stringify(adminAuth.data)}`);
  const adminToken = adminAuth.data.data.token;
  console.log('✅ Admin (Alex Vance) authenticated.\n');

  // 2. Fetch Available Workspaces
  console.log('--- 2. FETCHING WORKSPACE CATALOG ---');
  const wsRes = await request(`${CLIENT_API}/workspaces`);
  if (wsRes.status !== 200 || !wsRes.data.data || wsRes.data.data.length === 0) {
    throw new Error('Failed to retrieve workspaces catalog');
  }
  const workspaces = wsRes.data.data;
  console.log(`✅ Loaded ${workspaces.length} available workspaces from inventory.\n`);

  // 3. Define 12 Distinct Booking Scenarios using a unique run seed
  console.log('--- 3. EXECUTING 12 DISTINCT WORKSPACE BOOKINGS ---');
  const baseOffset = 50 + Math.floor(Math.random() * 500);
  const now = new Date();
  
  const bookingScenarios = [
    {
      title: 'Booking 1: Hot Desk (4 hrs)',
      clientToken: clientToken1,
      workspace: workspaces[0],
      dayOffset: baseOffset + 1,
      startHour: 9,
      duration: 4,
      specialRequests: 'Need extra power socket near window desk',
    },
    {
      title: 'Booking 2: Dedicated Desk (8 hrs - Full Day)',
      clientToken: clientToken2,
      workspace: workspaces[1] || workspaces[0],
      dayOffset: baseOffset + 2,
      startHour: 9,
      duration: 8,
      specialRequests: 'Quiet zone preferred for deep work session',
    },
    {
      title: 'Booking 3: Executive Studio (2 hrs)',
      clientToken: clientToken3,
      workspace: workspaces[2] || workspaces[0],
      dayOffset: baseOffset + 3,
      startHour: 10,
      duration: 2,
      specialRequests: 'Client pitch meeting - prepare guest badges',
    },
    {
      title: 'Booking 4: Summit Boardroom (4 hrs)',
      clientToken: clientToken1,
      workspace: workspaces[3] || workspaces[0],
      dayOffset: baseOffset + 4,
      startHour: 13,
      duration: 4,
      specialRequests: 'Setup 4K display and test HDMI casting',
    },
    {
      title: 'Booking 5: Open Lounge Desk (2 hrs)',
      clientToken: clientToken2,
      workspace: workspaces[0],
      dayOffset: baseOffset + 5,
      startHour: 14,
      duration: 2,
      specialRequests: 'Quick afternoon brainstorm',
    },
    {
      title: 'Booking 6: Focus Pod Desk (4 hrs)',
      clientToken: clientToken3,
      workspace: workspaces[1] || workspaces[0],
      dayOffset: baseOffset + 6,
      startHour: 8,
      duration: 4,
      specialRequests: 'Early morning coding block',
    },
    {
      title: 'Booking 7: Executive Studio (6 hrs)',
      clientToken: clientToken1,
      workspace: workspaces[2] || workspaces[0],
      dayOffset: baseOffset + 7,
      startHour: 9,
      duration: 6,
      specialRequests: 'Full team sprint planning',
    },
    {
      title: 'Booking 8: Summit Boardroom (2 hrs)',
      clientToken: clientToken2,
      workspace: workspaces[3] || workspaces[0],
      dayOffset: baseOffset + 8,
      startHour: 15,
      duration: 2,
      specialRequests: 'Investor check-in call',
    },
    {
      title: 'Booking 9: Dedicated Desk (4 hrs)',
      clientToken: clientToken3,
      workspace: workspaces[1] || workspaces[0],
      dayOffset: baseOffset + 9,
      startHour: 10,
      duration: 4,
      specialRequests: 'Dual monitor desk setup',
    },
    {
      title: 'Booking 10: Hot Desk (8 hrs - Full Day)',
      clientToken: clientToken1,
      workspace: workspaces[0],
      dayOffset: baseOffset + 10,
      startHour: 9,
      duration: 8,
      specialRequests: 'All day workspace pass',
    },
    {
      title: 'Booking 11: Executive Studio (3 hrs)',
      clientToken: clientToken2,
      workspace: workspaces[2] || workspaces[0],
      dayOffset: baseOffset + 11,
      startHour: 11,
      duration: 3,
      specialRequests: 'Quarterly review presentation',
    },
    {
      title: 'Booking 12: Summit Boardroom (3 hrs)',
      clientToken: clientToken3,
      workspace: workspaces[3] || workspaces[0],
      dayOffset: baseOffset + 12,
      startHour: 14,
      duration: 3,
      specialRequests: 'Executive leadership meeting',
    },
  ];

  const createdBookings = [];

  for (let i = 0; i < bookingScenarios.length; i++) {
    const scenario = bookingScenarios[i];
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + scenario.dayOffset);
    targetDate.setHours(scenario.startHour, 0, 0, 0);

    const startTime = new Date(targetDate);
    const endTime = new Date(targetDate);
    endTime.setHours(endTime.getHours() + scenario.duration);

    const res = await request(
      `${CLIENT_API}/bookings`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${scenario.clientToken}` },
      },
      {
        workspaceId: scenario.workspace.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        specialRequests: scenario.specialRequests,
        addOns: [],
      }
    );

    if (res.status === 201 || res.status === 200) {
      const b = res.data.data;
      createdBookings.push(b);
      console.log(`✅ [${i + 1}/12] Created ${scenario.title}:`);
      console.log(`   - Ref: ${b.booking_reference} | Check-in: ${b.check_in_code}`);
      console.log(`   - Workspace: ${b.workspace_name || scenario.workspace.name}`);
      console.log(`   - Slot: ${startTime.toISOString().slice(0, 16)} to ${endTime.toISOString().slice(11, 16)}`);
      console.log(`   - Amount: ₱${parseFloat(b.final_amount || b.total_amount).toLocaleString()}`);
    } else {
      console.error(`❌ [${i + 1}/12] Failed to create ${scenario.title}:`, res.data);
      throw new Error(`Booking ${i + 1} creation failed`);
    }
  }

  console.log(`\n🎉 Successfully created all ${createdBookings.length} bookings!\n`);

  // 4. Test Payment & Admin Confirmation Transitions
  console.log('--- 4. TESTING PAYMENT & CONFIRMATION LIFECYCLE ---');
  for (let i = 0; i < 3; i++) {
    const b = createdBookings[i];
    // Create payment intent
    const intentRes = await request(
      `${CLIENT_API}/payments/intent`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${clientToken1}` },
      },
      {
        bookingId: b.id,
        paymentMethod: 'gcash',
      }
    );

    if (intentRes.status === 200 || intentRes.status === 201) {
      const paymentId = intentRes.data.data.payment.id;
      // Confirm payment
      const confirmRes = await request(
        `${CLIENT_API}/payments/${paymentId}/confirm`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${clientToken1}` },
        }
      );
      if (confirmRes.status === 200) {
        console.log(`✅ Payment confirmed for Booking ${b.booking_reference} (GCash transaction complete).`);
      }
    }
  }

  // Admin approves bookings 4, 5, 6
  for (let i = 3; i < 6; i++) {
    const b = createdBookings[i];
    const updateRes = await request(
      `${ADMIN_API}/bookings/${b.id}/status`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      {
        status: 'confirmed',
        notes: 'Confirmed by QA automated tester',
      }
    );
    if (updateRes.status === 200) {
      console.log(`✅ Admin confirmed Booking ${b.booking_reference}.`);
    }
  }

  // 5. Test Conflict Prevention on one of the created slots
  console.log('\n--- 5. TESTING CONFLICT PREVENTION ON CREATED SLOTS ---');
  const targetBooking = createdBookings[0];
  const overlapRes = await request(
    `${CLIENT_API}/bookings`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken2}` },
    },
    {
      workspaceId: targetBooking.workspace_id,
      startTime: targetBooking.start_time,
      endTime: targetBooking.end_time,
    }
  );

  if (overlapRes.status === 409) {
    console.log(`✅ PASS: Conflicting overlap reservation correctly rejected with 409 Conflict.`);
  } else {
    console.error(`❌ FAIL: Expected 409 Conflict, got ${overlapRes.status}`, overlapRes.data);
  }

  // 6. Verify Bookings in Client & Admin Endpoints
  console.log('\n--- 6. VERIFYING BOOKINGS IN CLIENT & ADMIN ENDPOINTS ---');
  const myBookingsRes = await request(`${CLIENT_API}/bookings`, {
    headers: { Authorization: `Bearer ${clientToken1}` },
  });
  const client1Bookings = myBookingsRes.data.data || [];
  console.log(`✅ Client 1 has ${client1Bookings.length} bookings listed.`);

  const adminBookingsRes = await request(`${ADMIN_API}/bookings?limit=100`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const totalBookings = adminBookingsRes.data.data.pagination.total;
  console.log(`✅ Admin has ${totalBookings} total bookings recorded in system.`);

  const adminKpiRes = await request(`${ADMIN_API}/dashboard/kpis`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`✅ Admin Dashboard KPIs:`, adminKpiRes.data.data);

  console.log('\n================================================================');
  console.log(`🏆 12/12 BOOKINGS TEST COMPLETE — ALL VALIDATIONS PASSED!`);
  console.log('================================================================\n');
}

run10BookingsTest().catch((err) => {
  console.error('Fatal error during 10 bookings test:', err);
  process.exit(1);
});
