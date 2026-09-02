import { Router } from 'express';
import { clientWorkspaceController } from '../controllers/clientWorkspace.controller';
import { validateBody } from '../middleware/validate';
import { validateCheckAvailability } from '../validators/clientWorkspace.validator';

const router = Router();

router.get('/', (req, res, next) => clientWorkspaceController.getWorkspaces(req, res, next));
router.get('/:id', (req, res, next) => clientWorkspaceController.getWorkspaceDetails(req, res, next));
router.get('/:id/booked-slots', (req, res, next) => clientWorkspaceController.getBookedSlots(req, res, next));
router.post(
  '/:id/availability',
  validateBody(validateCheckAvailability),
  (req, res, next) => clientWorkspaceController.checkAvailability(req, res, next)
);

export default router;
