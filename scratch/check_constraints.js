require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const constraints = await pool.query(`
    SELECT conrelid::regclass, conname, contype, pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    WHERE conrelid IN ('email_verification_otps'::regclass, 'clients'::regclass)
  `);
  console.log('Constraints:', constraints.rows);

  const indexes = await pool.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename IN ('email_verification_otps', 'clients')
  `);
  console.log('Indexes:', indexes.rows);

  const clients = await pool.query('SELECT id, email, created_at FROM clients ORDER BY created_at DESC LIMIT 5');
  console.log('Recent clients:', clients.rows);

  const otps = await pool.query('SELECT id, email, attempts, is_verified, is_invalidated, last_sent_at, created_at FROM email_verification_otps ORDER BY created_at DESC LIMIT 5');
  console.log('Recent OTPs:', otps.rows);

  await pool.end();
}

check().catch(console.error);
