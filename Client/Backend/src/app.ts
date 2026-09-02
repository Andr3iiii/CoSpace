import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health.routes';
import clientRoutes from './routes/index';
import authRoutes from './routes/auth.routes';

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // In development or when origin matches CLIENT_URL, allowedOrigins, Render frontend, or Cloudflare tunnels/pages
      if (
        !origin ||
        origin === config.clientUrl ||
        origin === 'https://cospace-fe-client.onrender.com' ||
        origin.endsWith('.onrender.com') ||
        config.nodeEnv === 'development' ||
        config.allowedOrigins.includes(origin) ||
        origin.endsWith('.trycloudflare.com') ||
        origin.endsWith('.pages.dev') ||
        origin.endsWith('.workers.dev')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by Client CORS Policy'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check endpoint (Strictly matching requirement)
app.use('/', healthRoutes);

// Direct /api/auth endpoints alias
app.use('/api/auth', authRoutes);

// Client domain REST routes
app.use('/api/client', clientRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Client endpoint not found.',
    error: { code: 'NOT_FOUND' },
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
