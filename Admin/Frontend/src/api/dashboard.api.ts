import { apiClient } from './apiClient';
import { DashboardKpis } from '../types';

export const dashboardApi = {
  getKpis: () => apiClient.get<DashboardKpis>('/dashboard/kpis'),
  getAnalytics: () =>
    apiClient.get<{
      revenueTrends: Array<{ date: string; revenue: number }>;
      bookingTrends: Array<{ date: string; bookings: number }>;
      workspaceUtilization: Array<{ name: string; value: number }>;
    }>('/dashboard/analytics'),
  getRecentActivity: () => apiClient.get<any[]>('/dashboard/recent-activity'),
};
