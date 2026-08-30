import { Router } from 'express';
import { clientAuthController } from '../controllers/clientAuth.controller';
import { authenticateClient } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { validateClientRegister, validateClientLogin } from '../validators/clientAuth.validator';

const router = Router();

router.post('/register', validateBody(validateClientRegister), (req, res, next) => clientAuthController.register(req, res, next));
router.post('/login', validateBody(validateClientLogin), (req, res, next) => clientAuthController.login(req, res, next));
router.get('/me', authenticateClient, (req, res, next) => clientAuthController.me(req, res, next));
router.post('/logout', authenticateClient, (req, res) => clientAuthController.logout(req, res));

export default router;
