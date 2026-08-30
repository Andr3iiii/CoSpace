import { Response, NextFunction } from 'express';
import { adminDashboardService } from '../services/adminDashboard.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedAdminRequest } from '../middleware/auth';

export class AdminDashboardController {
  async getKpis(_req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminDashboardService.getKpis();
      sendSuccess(res, 'Dashboard KPIs fetched successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(_req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminDashboardService.getAnalytics();
      sendSuccess(res, 'Dashboard analytics data fetched.', result);
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(_req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminDashboardService.getRecentActivity();
      sendSuccess(res, 'Recent platform activity fetched.', result);
    } catch (error) {
      next(error);
    }
  }
}

export const adminDashboardController = new AdminDashboardController();
