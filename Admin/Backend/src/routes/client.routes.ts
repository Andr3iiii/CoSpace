import { Router } from 'express';
import { adminClientController } from '../controllers/adminClient.controller';
import { authenticateAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { validateClientStatusUpdate } from '../validators/adminClient.validator';

const router = Router();

router.use(authenticateAdmin);

router.get('/', (req, res, next) => adminClientController.getClients(req, res, next));
router.get('/:id', (req, res, next) => adminClientController.getClientById(req, res, next));
router.patch('/:id/status', validateBody(validateClientStatusUpdate), (req, res, next) => adminClientController.updateStatus(req, res, next));

export default router;
