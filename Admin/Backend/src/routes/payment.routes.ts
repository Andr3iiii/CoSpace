import { Router } from 'express';
import { adminPaymentController } from '../controllers/adminPayment.controller';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateAdmin);

router.get('/', (req, res, next) => adminPaymentController.getPayments(req, res, next));
router.get('/:id', (req, res, next) => adminPaymentController.getPaymentById(req, res, next));
router.post('/:id/refund', (req, res, next) => adminPaymentController.refund(req, res, next));

export default router;
