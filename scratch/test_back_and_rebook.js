require('dotenv').config();
const { Pool } = require('pg');

async function testBackAndRebook() {
  console.log('🧪 Testing "Back and Re-book" Scenario...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const ws = (await pool.query("SELECT * FROM workspaces WHERE status = 'available' LIMIT 1")).rows[0];
    const client = (await pool.query("SELECT * FROM clients LIMIT 1")).rows[0];

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);
    targetDate.setHours(9, 0, 0, 0);
    const start = targetDate.toISOString();
    const end = new Date(targetDate.getTime() + 4 * 3600000).toISOString();

    console.log(`1. Member creates first reservation for ${start}...`);
    const firstRes = await pool.query(
      `SELECT * FROM fn_create_booking_atomic(
        $1::uuid, $2::uuid, $3::timestamptz, $4::timestamptz,
        $5::varchar, $6::varchar, null,
        4, $7::numeric, $8::numeric, $8::numeric, $8::numeric,
        '[]'::jsonb, 'full'
      )`,
      [client.id, ws.id, start, end, `FIRST-${Date.now()}`, `CHK-1`, ws.hourly_rate, parseFloat(ws.hourly_rate) * 4]
    );
    const booking1 = firstRes.rows[0];
    console.log(`✓ First booking created: ID ${booking1.id}, status: ${booking1.status}`);

    console.log('2. Member clicks "Back" and attempts to book the same slot again with 50% deposit...');
    const secondRes = await pool.query(
      `SELECT * FROM fn_create_booking_atomic(
        $1::uuid, $2::uuid, $3::timestamptz, $4::timestamptz,
        $5::varchar, $6::varchar, null,
        4, $7::numeric, $8::numeric, $8::numeric, $8::numeric,
        '[]'::jsonb, 'deposit_50'
      )`,
      [client.id, ws.id, start, end, `SECOND-${Date.now()}`, `CHK-2`, ws.hourly_rate, parseFloat(ws.hourly_rate) * 4]
    );
    const booking2 = secondRes.rows[0];
    console.log(`✓ Re-booking succeeded! ID ${booking2.id}, status: ${booking2.status}, plan: ${booking2.payment_plan}`);

    // Verify first booking was superseded/cancelled
    const check1 = await pool.query('SELECT status, cancelled_reason FROM bookings WHERE id = $1', [booking1.id]);
    console.log(`✓ First booking status is now: ${check1.rows[0].status} (${check1.rows[0].cancelled_reason})`);

    if (check1.rows[0].status !== 'cancelled') {
      throw new Error('Expected first booking to be cancelled when member re-booked');
    }

    // Cleanup
    await pool.query('DELETE FROM booking_items WHERE booking_id IN ($1, $2)', [booking1.id, booking2.id]);
    await pool.query('DELETE FROM booking_status_history WHERE booking_id IN ($1, $2)', [booking1.id, booking2.id]);
    await pool.query('DELETE FROM bookings WHERE id IN ($1, $2)', [booking1.id, booking2.id]);

    console.log('🎉 "Back and Re-book" Scenario PASSED PERFECTLY!');
  } finally {
    await pool.end();
  }
}

testBackAndRebook().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
