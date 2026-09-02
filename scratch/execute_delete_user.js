require('dotenv').config();
const { Pool } = require('pg');

async function deleteUserSafely() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    const email = 'josephinejoy.bandola@gmail.com';
    const target = (await client.query('SELECT * FROM clients WHERE LOWER(email) = LOWER($1)', [email])).rows[0];

    if (!target) {
      console.log('No client found with email:', email);
      return;
    }

    console.log(`Found client to delete: ${target.first_name} ${target.last_name} (${target.email}), ID: ${target.id}`);

    await client.query('BEGIN');

    // 1. Delete associated payments
    const paymentsDel = await client.query('DELETE FROM payments WHERE client_id = $1 RETURNING id', [target.id]);
    console.log(`Deleted ${paymentsDel.rowCount} payment(s)`);

    // 2. Delete associated bookings (cascades to booking_items, booking_add_ons, booking_status_history)
    const bookingsDel = await client.query('DELETE FROM bookings WHERE client_id = $1 RETURNING id', [target.id]);
    console.log(`Deleted ${bookingsDel.rowCount} booking(s)`);

    // 3. Delete any email verifications
    const verifDel = await client.query('DELETE FROM email_verifications WHERE LOWER(email) = LOWER($1) RETURNING id', [email]);
    console.log(`Deleted ${verifDel.rowCount} email verification(s)`);

    // 4. Delete client record (cascades to profiles, sessions, activity logs, devices, notifications)
    const clientDel = await client.query('DELETE FROM clients WHERE id = $1 RETURNING id, first_name, last_name, email', [target.id]);
    console.log(`Deleted client record:`, clientDel.rows[0]);

    await client.query('COMMIT');
    console.log('✅ Transaction committed successfully. Account completely deleted from database.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Deletion failed, rolled back:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

deleteUserSafely().catch((e) => process.exit(1));
