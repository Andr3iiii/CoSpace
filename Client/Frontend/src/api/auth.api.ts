import { apiClient } from './apiClient';
import { ClientUser } from '../types';

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string; companyName?: string }) =>
    apiClient.post<{ token: string; client: ClientUser }>('/auth/register', data),
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<{ token: string; client: ClientUser }>('/auth/login', credentials),
  me: () => apiClient.get<ClientUser>('/auth/me'),
  logout: () => apiClient.post<void>('/auth/logout'),
};
