require('dotenv').config();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

async function runTest() {
  console.log('🧪 Running Booking & Add-ons Verification Suite...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const ws = (await pool.query("SELECT * FROM workspaces WHERE status = 'available' LIMIT 1")).rows[0];
    const client = (await pool.query("SELECT * FROM clients LIMIT 1")).rows[0];
    const addOns = (await pool.query("SELECT * FROM add_ons WHERE is_active = TRUE ORDER BY price ASC LIMIT 2")).rows;

    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 30);
    baseDate.setHours(9, 0, 0, 0);

    const startWithout = baseDate.toISOString();
    const endWithout = new Date(baseDate.getTime() + 2 * 3600000).toISOString();

    console.log('\n--- 1. Testing Booking WITHOUT Add-ons ---');
    const res1 = await pool.query(
      `SELECT * FROM fn_create_booking_atomic(
        $1::uuid, $2::uuid, $3::timestamptz, $4::timestamptz,
        $5::varchar, $6::varchar, null,
        2, $7::numeric, $8::numeric, $8::numeric, $8::numeric,
        '[]'::jsonb, 'full'
      )`,
      [
        client.id,
        ws.id,
        startWithout,
        endWithout,
        `NO-ADDON-${Date.now()}`,
        `CHK-NO`,
        ws.hourly_rate,
        parseFloat(ws.hourly_rate) * 2,
      ]
    );

    const bookingWithout = res1.rows[0];
    console.log(`✓ Booking without add-ons created successfully: ID ${bookingWithout.id}`);
    console.log(`  Reference: ${bookingWithout.booking_reference}, Status: ${bookingWithout.status}, Total: ₱${bookingWithout.total_amount}`);

    console.log('\n--- 2. Testing Booking WITH Add-ons (Checking NOT NULL subtotal fix) ---');
    const nextDate = new Date(baseDate.getTime() + 24 * 3600000);
    const startWith = nextDate.toISOString();
    const endWith = new Date(nextDate.getTime() + 4 * 3600000).toISOString();

    const addOn1 = addOns[0]; // e.g. 250
    const addOn2 = addOns[1]; // e.g. 300
    const hours = 4;
    const wsRate = parseFloat(ws.hourly_rate);
    const wsSubtotal = wsRate * hours;
    const q1 = 1;
    const q2 = 2;
    const addOn1Subtotal = parseFloat(addOn1.price) * q1;
    const addOn2Subtotal = parseFloat(addOn2.price) * q2;
    const totalAmount = wsSubtotal + addOn1Subtotal + addOn2Subtotal;

    const addOnsPayload = [
      {
        id: addOn1.id,
        add_on_id: addOn1.id,
        name: addOn1.name,
        unit_price: parseFloat(addOn1.price),
        quantity: q1,
        subtotal: addOn1Subtotal,
      },
      {
        id: addOn2.id,
        add_on_id: addOn2.id,
        name: addOn2.name,
        unit_price: parseFloat(addOn2.price),
        quantity: q2,
        subtotal: addOn2Subtotal,
      },
    ];

    const res2 = await pool.query(
      `SELECT * FROM fn_create_booking_atomic(
        $1::uuid, $2::uuid, $3::timestamptz, $4::timestamptz,
        $5::varchar, $6::varchar, 'Add-ons test reservation',
        $7::numeric, $8::numeric, $9::numeric, $10::numeric, $10::numeric,
        $11::jsonb, 'deposit_50'
      )`,
      [
        client.id,
        ws.id,
        startWith,
        endWith,
        `WITH-ADDON-${Date.now()}`,
        `CHK-ADD`,
        hours,
        wsRate,
        wsSubtotal,
        totalAmount,
        JSON.stringify(addOnsPayload),
      ]
    );

    const bookingWith = res2.rows[0];
    console.log(`✓ Booking WITH add-ons created successfully: ID ${bookingWith.id}`);
    console.log(`  Reference: ${bookingWith.booking_reference}, Status: ${bookingWith.status}, Total: ₱${bookingWith.total_amount}`);

    console.log('\n--- 3. Verifying booking_add_ons Table Rows & Subtotals ---');
    const addOnsRows = (await pool.query(
      'SELECT id, add_on_id, quantity, unit_price, subtotal FROM booking_add_ons WHERE booking_id = $1 ORDER BY unit_price ASC',
      [bookingWith.id]
    )).rows;

    console.log(`✓ Found ${addOnsRows.length} add-on record(s) in booking_add_ons:`);
    for (const row of addOnsRows) {
      const expectedSubtotal = parseFloat(row.unit_price) * row.quantity;
      const actualSubtotal = parseFloat(row.subtotal);
      console.log(`  • Add-on ${row.add_on_id}: Qty ${row.quantity} × ₱${row.unit_price} = ₱${actualSubtotal} (Expected: ₱${expectedSubtotal})`);
      if (actualSubtotal !== expectedSubtotal) {
        throw new Error(`Subtotal mismatch! Expected ${expectedSubtotal}, got ${actualSubtotal}`);
      }
      if (row.subtotal === null || row.subtotal === undefined) {
        throw new Error(`Subtotal is null or undefined (violates NOT NULL)!`);
      }
    }

    console.log('\n--- 4. Testing End-to-End HTTP Request to POST /api/client/bookings ---');
    const token = jwt.sign(
      { id: client.id, email: client.email, status: client.status, type: 'client' },
      process.env.JWT_SECRET || 'cospace-secret-key-production-ready-secure-jwt'
    );

    const httpDate = new Date(baseDate.getTime() + 48 * 3600000);
    const httpStart = httpDate.toISOString();
    const httpEnd = new Date(httpDate.getTime() + 3 * 3600000).toISOString();

    const httpRes = await fetch('http://localhost:3001/api/client/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        workspaceId: ws.id,
        startTime: httpStart,
        endTime: httpEnd,
        paymentPlan: 'full',
        addOns: [
          { addOnId: addOn1.id, quantity: 2 },
        ],
        specialRequests: 'End-to-end add-on verification',
      }),
    });

    console.log(`HTTP POST Status: ${httpRes.status}`);
    const httpBody = await httpRes.json();
    console.log(`HTTP Response Success: ${httpBody.success}`);
    if (httpRes.status !== 201) {
      throw new Error(`HTTP Request failed: ${JSON.stringify(httpBody)}`);
    }
    console.log(`✓ HTTP Booking ID: ${httpBody.data.id}, Reference: ${httpBody.data.booking_reference}`);

    // Cleanup test bookings
    await pool.query('DELETE FROM booking_add_ons WHERE booking_id IN ($1, $2, $3)', [
      bookingWithout.id,
      bookingWith.id,
      httpBody.data.id,
    ]);
    await pool.query('DELETE FROM booking_items WHERE booking_id IN ($1, $2, $3)', [
      bookingWithout.id,
      bookingWith.id,
      httpBody.data.id,
    ]);
    await pool.query('DELETE FROM booking_status_history WHERE booking_id IN ($1, $2, $3)', [
      bookingWithout.id,
      bookingWith.id,
      httpBody.data.id,
    ]);
    await pool.query('DELETE FROM bookings WHERE id IN ($1, $2, $3)', [
      bookingWithout.id,
      bookingWith.id,
      httpBody.data.id,
    ]);

    console.log('\n🎉 ALL TESTS PASSED: Both bookings with and without add-ons work seamlessly, subtotal NOT NULL constraint is satisfied, and HTTP endpoint returns 201 Created!');
  } finally {
    await pool.end();
  }
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
