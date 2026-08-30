import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health.routes';
import clientRoutes from './routes/index';

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // In development or when origin matches CLIENT_URL
      if (!origin || origin === config.clientUrl || config.nodeEnv === 'development') {
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
