import { apiClient } from './apiClient';
import { Client } from '../types';

export const clientApi = {
  getClients: (params?: Record<string, any>) =>
    apiClient.get<{ items: Client[]; pagination: any }>('/clients', params),
  getClientById: (id: string) => apiClient.get<Client>(`/clients/${id}`),
  updateStatus: (id: string, status: 'active' | 'suspended' | 'inactive') =>
    apiClient.patch<Client>(`/clients/${id}/status`, { status }),
};
