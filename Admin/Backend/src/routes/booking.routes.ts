import { Router } from 'express';
import { adminBookingController } from '../controllers/adminBooking.controller';
import { authenticateAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { validateBookingStatusUpdate, validateBookingReschedule } from '../validators/adminBooking.validator';

const router = Router();

router.use(authenticateAdmin);

router.get('/', (req, res, next) => adminBookingController.getBookings(req, res, next));
router.get('/:id', (req, res, next) => adminBookingController.getBookingById(req, res, next));
router.patch('/:id/status', validateBody(validateBookingStatusUpdate), (req, res, next) => adminBookingController.updateStatus(req, res, next));
router.post('/:id/reschedule', validateBody(validateBookingReschedule), (req, res, next) => adminBookingController.reschedule(req, res, next));

export default router;
