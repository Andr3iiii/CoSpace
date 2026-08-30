const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '../../Admin/Backend/.env') });

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/cospace_db';
const pool = new Pool({ connectionString });

async function resetDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 Resetting CoSpace Database (Running schema.sql + seed.sql)...');
    const schemaSql = fs.readFileSync(path.join(__dirname, '../schema/schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('✅ Schema rebuilt.');

    const seedSql = fs.readFileSync(path.join(__dirname, '../seeds/seed.sql'), 'utf8');
    await client.query(seedSql);
    console.log('✅ Seeds injected.');

    console.log('🎉 Database reset complete!');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();
