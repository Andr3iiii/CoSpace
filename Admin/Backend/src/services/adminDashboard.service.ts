import { adminDashboardRepository } from '../repositories/dashboard.repository';

export class AdminDashboardService {
  async getKpis() {
    return adminDashboardRepository.getKpis();
  }

  async getAnalytics() {
    return adminDashboardRepository.getAnalytics();
  }

  async getRecentActivity() {
    return adminDashboardRepository.getRecentActivity();
  }
}

export const adminDashboardService = new AdminDashboardService();
