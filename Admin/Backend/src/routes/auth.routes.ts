import { Router } from 'express';
import { adminAuthController } from '../controllers/adminAuth.controller';
import { authenticateAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { validateAdminLogin } from '../validators/adminAuth.validator';

const router = Router();

router.post('/login', validateBody(validateAdminLogin), (req, res, next) => adminAuthController.login(req, res, next));
router.get('/me', authenticateAdmin, (req, res, next) => adminAuthController.me(req, res, next));
router.post('/logout', authenticateAdmin, (req, res) => adminAuthController.logout(req, res));

export default router;
