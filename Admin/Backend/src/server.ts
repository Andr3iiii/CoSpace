import app from './app';
import { config } from './config';
import { pool } from './database/connection';

const PORT = config.port;

const server = app.listen(PORT, async () => {
  console.log(`=============================================`);
  console.log(`🏢 CoSpace Admin Backend Running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/health`);
  console.log(`🔒 Environment: ${config.nodeEnv}`);
  console.log(`=============================================`);

  try {
    const client = await pool.connect();
    console.log('✅ Connected to Shared PostgreSQL Database successfully');
    client.release();
  } catch (err: any) {
    console.warn('⚠️ Warning: Could not connect to PostgreSQL immediately:', err.message);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await pool.end();
    console.log('Admin backend database pool closed.');
  });
});
