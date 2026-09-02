require('dotenv').config();
const { Pool } = require('pg');

async function checkUser() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const email = 'josephinejoy.bandola@gmail.com';
    const clientRows = (await pool.query('SELECT id, first_name, last_name, email, phone, status, created_at FROM clients WHERE LOWER(email) = LOWER($1)', [email])).rows;
    console.log('Client records found:', clientRows);

    if (clientRows.length === 0) {
      console.log('No client found with email:', email);
      return;
    }

    const clientId = clientRows[0].id;
    const bookings = (await pool.query('SELECT id, booking_reference, status FROM bookings WHERE client_id = $1', [clientId])).rows;
    console.log(`Associated bookings (${bookings.length}):`, bookings);

    const verifications = (await pool.query('SELECT id, email, is_verified, created_at FROM email_verifications WHERE LOWER(email) = LOWER($1)', [email])).rows;
    console.log(`Associated email_verifications (${verifications.length}):`, verifications);

    const payments = (await pool.query('SELECT id, amount, status FROM payments WHERE client_id = $1', [clientId])).rows;
    console.log(`Associated payments (${payments.length}):`, payments);
  } finally {
    await pool.end();
  }
}

checkUser().catch(console.error);
