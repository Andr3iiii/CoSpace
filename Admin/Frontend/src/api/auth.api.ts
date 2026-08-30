import { apiClient } from './apiClient';
import { AdminUser } from '../types';

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<{ token: string; admin: AdminUser }>('/auth/login', credentials),
  me: () => apiClient.get<AdminUser>('/auth/me'),
  logout: () => apiClient.post<void>('/auth/logout'),
};
