import { apiClient } from './apiClient';

export const reportApi = {
  getReports: (startDate?: string, endDate?: string) =>
    apiClient.get<any>('/reports', { startDate, endDate }),
};
