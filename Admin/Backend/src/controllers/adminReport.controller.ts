import { Response, NextFunction } from 'express';
import { adminReportService } from '../services/adminReport.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedAdminRequest } from '../middleware/auth';

export class AdminReportController {
  async getReports(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const result = await adminReportService.getReports(startDate as string, endDate as string);
      sendSuccess(res, 'Reports generated successfully.', result);
    } catch (error) {
      next(error);
    }
  }
}

export const adminReportController = new AdminReportController();
