import { Router } from 'express';
import { clientNotificationController } from '../controllers/clientNotification.controller';
import { authenticateClient } from '../middleware/auth';

const router = Router();

router.use(authenticateClient);

router.get('/', (req, res, next) => clientNotificationController.getNotifications(req, res, next));
router.patch('/:id/read', (req, res, next) => clientNotificationController.markAsRead(req, res, next));

export default router;
