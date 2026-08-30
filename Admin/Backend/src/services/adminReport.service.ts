import { adminReportRepository } from '../repositories/report.repository';

export class AdminReportService {
  async getReports(startDate?: string, endDate?: string) {
    return adminReportRepository.generateSummary(startDate, endDate);
  }
}

export const adminReportService = new AdminReportService();
