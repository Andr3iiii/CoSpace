import { Router } from 'express';
import authRoutes from './auth.routes';
import workspaceRoutes from './workspace.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
import profileRoutes from './profile.routes';
import favoriteRoutes from './favorite.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/profile', profileRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/notifications', notificationRoutes);

export default router;
