import { apiClient } from './apiClient';
import { AdminUser, DashboardKpis, Booking, Client, Workspace, Payment } from '../types';

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<{ token: string; admin: AdminUser }>('/auth/login', credentials),
  me: () => apiClient.get<AdminUser>('/auth/me'),
  logout: () => apiClient.post<void>('/auth/logout'),
};

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

export const bookingApi = {
  getBookings: (params?: Record<string, any>) =>
    apiClient.get<{ items: Booking[]; pagination: any }>('/bookings', params),
  getBookingById: (id: string) => apiClient.get<Booking>(`/bookings/${id}`),
  updateStatus: (id: string, status: string, reason?: string) =>
    apiClient.patch<Booking>(`/bookings/${id}/status`, { status, reason }),
  reschedule: (id: string, startTime: string, endTime: string) =>
    apiClient.post<Booking>(`/bookings/${id}/reschedule`, { startTime, endTime }),
};

export const clientApi = {
  getClients: (params?: Record<string, any>) =>
    apiClient.get<{ items: Client[]; pagination: any }>('/clients', params),
  getClientById: (id: string) => apiClient.get<Client>(`/clients/${id}`),
  updateStatus: (id: string, status: 'active' | 'suspended' | 'inactive') =>
    apiClient.patch<Client>(`/clients/${id}/status`, { status }),
};

export const workspaceApi = {
  getWorkspaces: (params?: Record<string, any>) =>
    apiClient.get<{ items: Workspace[]; pagination: any }>('/workspaces', params),
  getWorkspaceById: (id: string) => apiClient.get<Workspace>(`/workspaces/${id}`),
  createWorkspace: (data: any) => apiClient.post<Workspace>('/workspaces', data),
  updateWorkspace: (id: string, data: any) => apiClient.put<Workspace>(`/workspaces/${id}`, data),
  updateStatus: (id: string, status: string) => apiClient.patch<Workspace>(`/workspaces/${id}/status`, { status }),
  getMetadata: () => apiClient.get<{ types: any[]; amenities: any[] }>('/workspaces/meta/types-and-amenities'),
};

export const paymentApi = {
  getPayments: (params?: Record<string, any>) =>
    apiClient.get<{ items: Payment[]; pagination: any }>('/payments', params),
  getPaymentById: (id: string) => apiClient.get<Payment>(`/payments/${id}`),
  refund: (id: string, amount: number, reason: string) =>
    apiClient.post<any>(`/payments/${id}/refund`, { amount, reason }),
};

export const reportApi = {
  getReports: (startDate?: string, endDate?: string) =>
    apiClient.get<any>('/reports', { startDate, endDate }),
};
