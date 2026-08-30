import { Router } from 'express';
import { adminDashboardController } from '../controllers/adminDashboard.controller';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateAdmin);

router.get('/kpis', (req, res, next) => adminDashboardController.getKpis(req, res, next));
router.get('/analytics', (req, res, next) => adminDashboardController.getAnalytics(req, res, next));
router.get('/recent-activity', (req, res, next) => adminDashboardController.getRecentActivity(req, res, next));

export default router;
