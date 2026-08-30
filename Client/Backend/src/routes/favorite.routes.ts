import { Router } from 'express';
import { clientFavoriteController } from '../controllers/clientFavorite.controller';
import { authenticateClient } from '../middleware/auth';

const router = Router();

router.use(authenticateClient);

router.get('/', (req, res, next) => clientFavoriteController.getFavorites(req, res, next));
router.post('/:workspaceId', (req, res, next) => clientFavoriteController.toggleFavorite(req, res, next));

export default router;
