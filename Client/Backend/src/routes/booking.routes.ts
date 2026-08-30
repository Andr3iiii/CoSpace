import { Router } from 'express';
import { clientBookingController } from '../controllers/clientBooking.controller';
import { authenticateClient } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { validateCreateBooking } from '../validators/clientBooking.validator';

const router = Router();

router.use(authenticateClient);

router.get('/', (req, res, next) => clientBookingController.getMyBookings(req, res, next));
router.get('/:id', (req, res, next) => clientBookingController.getBookingDetail(req, res, next));
router.post('/', validateBody(validateCreateBooking), (req, res, next) => clientBookingController.createBooking(req, res, next));
router.post('/:id/cancel', (req, res, next) => clientBookingController.cancelBooking(req, res, next));

export default router;
