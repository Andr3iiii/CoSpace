const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/cospace_db',
});

async function debug() {
  const ws = await pool.query('SELECT id FROM workspaces LIMIT 1');
  const client = await pool.query('SELECT id FROM clients LIMIT 1');
  const addon = await pool.query('SELECT id, price FROM add_ons LIMIT 1');

  const addOnsPayload = JSON.stringify([
    {
      id: addon.rows[0].id,
      add_on_id: addon.rows[0].id,
      addOnId: addon.rows[0].id,
      quantity: 2,
      unitPrice: 250,
      unit_price: 250,
      subtotal: 500,
    },
  ]);

  try {
    const res = await pool.query(
      `SELECT * FROM fn_create_booking_atomic(
        $1::uuid,
        $2::uuid,
        $3::timestamptz,
        $4::timestamptz,
        $5::varchar,
        $6::varchar,
        $7::text,
        $8::numeric,
        $9::numeric,
        $10::numeric,
        $11::numeric,
        $12::numeric,
        $13::jsonb
      )`,
      [
        client.rows[0].id,
        ws.rows[0].id,
        new Date('2028-01-01T09:00:00Z'),
        new Date('2028-01-01T13:00:00Z'),
        'CSP-TEST-' + Math.floor(Math.random() * 10000),
        'QR-TEST-' + Math.floor(Math.random() * 10000),
        'Test Special Request',
        4,
        150,
        600,
        1100,
        1100,
        addOnsPayload,
      ]
    );
    console.log('Success!', res.rows[0]);
  } catch (err) {
    console.error('SQL Execution Error:', err);
  } finally {
    await pool.end();
  }
}

debug();
