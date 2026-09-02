require('dotenv').config();
const { Pool } = require('pg');

async function runE2ETest() {
  console.log('🧪 Starting Booking Flow, 10-Minute Hold, 50% Deposit & Concurrency Tests...\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // 1. Fetch available workspace and client
    const wsRes = await pool.query("SELECT * FROM workspaces WHERE status = 'available' LIMIT 1");
    if (wsRes.rows.length === 0) {
      throw new Error('No available workspace found for test');
    }
    const ws = wsRes.rows[0];

    const clientRes = await pool.query('SELECT * FROM clients LIMIT 2');
    if (clientRes.rows.length === 0) {
      throw new Error('No client found for test');
    }
    const clientA = clientRes.rows[0];
    const clientB = clientRes.rows[1] || clientA;

    console.log(`✓ Test Workspace: "${ws.name}" (${ws.id})`);
    console.log(`✓ Test Client A: ${clientA.email} (${clientA.id})`);
    if (clientB.id !== clientA.id) {
      console.log(`✓ Test Client B: ${clientB.email} (${clientB.id})`);
    }

    // 2. Choose test time slot tomorrow 14:00 - 18:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(14, 0, 0, 0);
    const startTime = tomorrow.toISOString();

    const endSlot = new Date(tomorrow);
    endSlot.setHours(18, 0, 0, 0);
    const endTime = endSlot.toISOString();

    const bookingRefA = `TEST-BKG-${Date.now()}-A`;
    const checkInCodeA = `CHK-${Math.floor(100000 + Math.random() * 900000)}`;

    // Clean up any lingering test bookings from prior runs
    await pool.query("DELETE FROM payments WHERE booking_id IN (SELECT id FROM bookings WHERE booking_reference LIKE 'TEST-BKG-%')");
    await pool.query("DELETE FROM booking_items WHERE booking_id IN (SELECT id FROM bookings WHERE booking_reference LIKE 'TEST-BKG-%')");
    await pool.query("DELETE FROM booking_status_history WHERE booking_id IN (SELECT id FROM bookings WHERE booking_reference LIKE 'TEST-BKG-%')");
    await pool.query("DELETE FROM bookings WHERE booking_reference LIKE 'TEST-BKG-%'");

    console.log(`\n--- Test 1: Atomic Booking with 10-Minute Hold & 50% Deposit ---`);
    const createResA = await pool.query(
      `SELECT * FROM fn_create_booking_atomic(
        $1::uuid, $2::uuid, $3::timestamptz, $4::timestamptz,
        $5::varchar, $6::varchar, $7::text,
        4, $8::numeric, $9::numeric, $9::numeric, $9::numeric,
        '[]'::jsonb, 'deposit_50'
      )`,
      [
        clientA.id,
        ws.id,
        startTime,
        endTime,
        bookingRefA,
        checkInCodeA,
        'Test Special Request',
        ws.hourly_rate,
        parseFloat(ws.hourly_rate) * 4,
      ]
    );

    const bookingA = createResA.rows[0];
    console.log(`✓ Booking A created with reference: ${bookingA.booking_reference}`);
    console.log(`✓ Booking Status: ${bookingA.status} (pending)`);
    console.log(`✓ Payment Plan: ${bookingA.payment_plan}`);
    console.log(`✓ Hold Expires At: ${bookingA.hold_expires_at}`);
    console.log(`✓ Total: ₱${bookingA.final_amount} | Paid: ₱${bookingA.paid_amount} | Remaining: ₱${bookingA.remaining_balance}`);

    if (bookingA.status !== 'pending') throw new Error('Expected status to be pending');
    if (bookingA.payment_plan !== 'deposit_50') throw new Error('Expected payment_plan to be deposit_50');
    if (!bookingA.hold_expires_at) throw new Error('Expected hold_expires_at to be populated');
    const expectedHalf = Math.round(parseFloat(bookingA.final_amount) * 0.5 * 100) / 100;
    if (parseFloat(bookingA.remaining_balance) !== expectedHalf) {
      throw new Error(`Expected remaining_balance to be ${expectedHalf}, got ${bookingA.remaining_balance}`);
    }

    console.log(`\n--- Test 2: Concurrency & Double-Booking Protection (Simultaneous Conflict) ---`);
    const bookingRefB = `TEST-BKG-${Date.now()}-B`;
    const checkInCodeB = `CHK-${Math.floor(100000 + Math.random() * 900000)}`;

    let conflictCaught = false;
    try {
      await pool.query(
        `SELECT * FROM fn_create_booking_atomic(
          $1::uuid, $2::uuid, $3::timestamptz, $4::timestamptz,
          $5::varchar, $6::varchar, $7::text,
          4, $8::numeric, $9::numeric, $9::numeric, $9::numeric,
          '[]'::jsonb, 'full'
        )`,
        [
          clientB.id,
          ws.id,
          startTime,
          endTime,
          bookingRefB,
          checkInCodeB,
          'Conflict Request',
          ws.hourly_rate,
          parseFloat(ws.hourly_rate) * 4,
        ]
      );
    } catch (err) {
      if (err.code === '23P01' || err.message.includes('booked by another member')) {
        conflictCaught = true;
        console.log(`✓ Expected Conflict Thrown: [Code: ${err.code}] "${err.message}"`);
      } else {
        throw err;
      }
    }

    if (!conflictCaught) {
      throw new Error('FAILED: Double booking was allowed during active 10-minute hold!');
    }

    console.log(`\n--- Test 3: Availability Check Rejection During Hold ---`);
    const availCheck = await pool.query(
      `SELECT fn_check_workspace_availability($1::uuid, $2::timestamptz, $3::timestamptz) as is_available`,
      [ws.id, startTime, endTime]
    );
    console.log(`✓ fn_check_workspace_availability is: ${availCheck.rows[0].is_available}`);
    if (availCheck.rows[0].is_available !== false) {
      throw new Error('Expected slot to be reported unavailable during active 10-minute hold');
    }

    console.log(`\n--- Test 4: Booked Slots Query Integration ---`);
    const dateStr = tomorrow.toISOString().split('T')[0];
    const slotsRes = await pool.query(
      `SELECT start_time, end_time, status
       FROM bookings
       WHERE workspace_id = $1
         AND (status IN ('confirmed', 'active') OR (status = 'pending' AND hold_expires_at > CURRENT_TIMESTAMP))
         AND DATE(start_time) = $2::date`,
      [ws.id, dateStr]
    );
    console.log(`✓ Found ${slotsRes.rows.length} booked/held slot(s) for date ${dateStr}`);
    if (slotsRes.rows.length === 0) {
      throw new Error('Expected held booking to appear in booked-slots query');
    }

    console.log(`\n--- Test 5: Payment Intent & 50% Deposit Confirmation ---`);
    const depositToCharge = Math.round(parseFloat(bookingA.final_amount) * 0.5 * 100) / 100;
    const pmtRes = await pool.query(
      `INSERT INTO payments (
        booking_id, client_id, amount, currency, status, provider, payment_method_type, transaction_reference, provider_payment_id
      ) VALUES ($1, $2, $3, 'PHP', 'pending', 'paymongo', 'gcash', $4, $5)
      RETURNING *`,
      [bookingA.id, clientA.id, depositToCharge, `TXN-${Date.now()}`, `pi_${Date.now()}`]
    );
    const paymentRecord = pmtRes.rows[0];
    console.log(`✓ Payment record created: ID ${paymentRecord.id}, Amount ₱${paymentRecord.amount}`);

    // Confirm payment with IDOR check
    const { clientPaymentRepository } = require('../Client/Backend/dist/repositories/clientPayment.repository');
    const confirmResult = await clientPaymentRepository.confirmPaymentSuccess(paymentRecord.id, clientA.id);

    console.log(`✓ Payment successfully confirmed! Booking status: ${confirmResult.booking.status}`);
    console.log(`✓ Booking Paid Amount: ₱${confirmResult.booking.paid_amount}`);
    console.log(`✓ Booking Remaining Balance: ₱${confirmResult.booking.remaining_balance}`);
    console.log(`✓ Hold Expires At cleared to: ${confirmResult.booking.hold_expires_at}`);

    if (confirmResult.booking.status !== 'confirmed') throw new Error('Expected booking to be confirmed');
    if (parseFloat(confirmResult.booking.paid_amount) !== depositToCharge) {
      throw new Error(`Expected paid_amount to be ${depositToCharge}, got ${confirmResult.booking.paid_amount}`);
    }
    if (parseFloat(confirmResult.booking.remaining_balance) !== depositToCharge) {
      throw new Error(`Expected remaining_balance to be ${depositToCharge}, got ${confirmResult.booking.remaining_balance}`);
    }
    if (confirmResult.booking.hold_expires_at !== null) {
      throw new Error('Expected hold_expires_at to be NULL after payment confirmation');
    }

    // Clean up test booking and payment to leave database in pristine state
    await pool.query('DELETE FROM payments WHERE booking_id = $1', [bookingA.id]);
    await pool.query('DELETE FROM booking_items WHERE booking_id = $1', [bookingA.id]);
    await pool.query('DELETE FROM booking_status_history WHERE booking_id = $1', [bookingA.id]);
    await pool.query('DELETE FROM notifications WHERE action_url = $1', [`/bookings/${bookingA.id}`]);
    await pool.query('DELETE FROM bookings WHERE id = $1', [bookingA.id]);
    console.log(`\n✓ Test artifacts cleaned up successfully.`);

    console.log(`\n🎉 ALL 5 BOOKING FLOW & CONCURRENCY TESTS PASSED WITH FLYING COLORS!`);
  } finally {
    await pool.end();
  }
}

runE2ETest().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
