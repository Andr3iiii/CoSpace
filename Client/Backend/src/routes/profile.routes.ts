import { Router } from 'express';
import { clientProfileController } from '../controllers/clientProfile.controller';
import { authenticateClient } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { validateUpdateProfile } from '../validators/clientProfile.validator';

const router = Router();

router.use(authenticateClient);

router.get('/', (req, res, next) => clientProfileController.getProfile(req, res, next));
router.put('/', validateBody(validateUpdateProfile), (req, res, next) => clientProfileController.updateProfile(req, res, next));
router.put('/preferences', (req, res, next) => clientProfileController.updatePreferences(req, res, next));

export default router;
