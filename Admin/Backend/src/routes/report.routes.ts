import { Router } from 'express';
import { adminReportController } from '../controllers/adminReport.controller';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateAdmin);

router.get('/', (req, res, next) => adminReportController.getReports(req, res, next));

export default router;
