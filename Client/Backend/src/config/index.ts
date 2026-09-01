import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Look for global root .env with fallbacks
const envCandidates = [
  path.resolve(__dirname, '../../../../.env'), // Monorepo root from src/config or dist/config
  path.resolve(process.cwd(), '.env'),        // Current working directory
  path.resolve(process.cwd(), '../../.env'),  // Root if cwd is Client/Backend
  path.resolve(__dirname, '../../.env'),      // Local fallback
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

export const config = {
  port: parseInt(process.env.CLIENT_BACKEND_PORT || process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/cospace_db',
  jwt: {
    secret: process.env.JWT_SECRET || 'cospace_client_default_dev_secret_key_32chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },
  paymongo: {
    secretKey: process.env.PAYMONGO_SECRET_KEY || 'sk_test_mock',
    publicKey: process.env.PAYMONGO_PUBLIC_KEY || 'pk_test_mock',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'cospace-demo',
    apiKey: process.env.CLOUDINARY_API_KEY || 'mock_key',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'mock_secret',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || 're_mock_key',
  },
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || 'mock_maps_key',
  },
  clientUrl: process.env.CLIENT_FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173',
  adminUrl: process.env.ADMIN_FRONTEND_URL || process.env.ADMIN_URL || 'http://localhost:5174',
};

