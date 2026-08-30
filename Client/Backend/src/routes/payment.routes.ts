import { Router } from 'express';
import { clientPaymentController } from '../controllers/clientPayment.controller';
import { authenticateClient } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { validatePaymentIntent } from '../validators/clientProfile.validator';

const router = Router();

// Public webhook
router.post('/webhook', (req, res) => clientPaymentController.webhook(req, res));

// Authenticated payment endpoints
router.post('/create-intent', authenticateClient, validateBody(validatePaymentIntent), (req, res, next) => clientPaymentController.createIntent(req, res, next));
router.post('/confirm', authenticateClient, (req, res, next) => clientPaymentController.confirmPayment(req, res, next));

export default router;
