const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '../../Admin/Backend/.env') });

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/cospace_db';
const pool = new Pool({ connectionString });

async function runSeed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding CoSpace Database...');
    const seedFile = path.join(__dirname, '../seeds/seed.sql');
    const sql = fs.readFileSync(seedFile, 'utf8');
    await client.query(sql);
    console.log('✅ CoSpace Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
