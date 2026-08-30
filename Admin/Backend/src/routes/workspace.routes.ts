import { Router } from 'express';
import { adminWorkspaceController } from '../controllers/adminWorkspace.controller';
import { authenticateAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { validateWorkspaceCreate } from '../validators/adminWorkspace.validator';

const router = Router();

router.use(authenticateAdmin);

router.get('/meta/types-and-amenities', (req, res, next) => adminWorkspaceController.getMetadata(req, res, next));
router.get('/', (req, res, next) => adminWorkspaceController.getWorkspaces(req, res, next));
router.get('/:id', (req, res, next) => adminWorkspaceController.getWorkspaceById(req, res, next));
router.post('/', validateBody(validateWorkspaceCreate), (req, res, next) => adminWorkspaceController.createWorkspace(req, res, next));
router.put('/:id', (req, res, next) => adminWorkspaceController.updateWorkspace(req, res, next));
router.patch('/:id/status', (req, res, next) => adminWorkspaceController.updateStatus(req, res, next));

export default router;
