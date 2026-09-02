import { Router } from 'express';
import { clientAuthController } from '../controllers/clientAuth.controller';
import { authenticateClient } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  validateSendOtp,
  validateVerifyOtp,
  validateClientRegister,
  validateClientLogin,
} from '../validators/clientAuth.validator';

const router = Router();

// OTP Email Verification Endpoints
router.post('/send-otp', validateBody(validateSendOtp), (req, res, next) => clientAuthController.sendOtp(req, res, next));
router.post('/verify-otp', validateBody(validateVerifyOtp), (req, res, next) => clientAuthController.verifyOtp(req, res, next));

// Authentication Endpoints
router.post('/register', validateBody(validateClientRegister), (req, res, next) => clientAuthController.register(req, res, next));
router.post('/login', validateBody(validateClientLogin), (req, res, next) => clientAuthController.login(req, res, next));
router.get('/me', authenticateClient, (req, res, next) => clientAuthController.me(req, res, next));
router.post('/logout', authenticateClient, (req, res) => clientAuthController.logout(req, res));

export default router;
