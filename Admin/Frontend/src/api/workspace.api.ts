import { apiClient } from './apiClient';
import { Workspace } from '../types';

export const workspaceApi = {
  getWorkspaces: (params?: Record<string, any>) =>
    apiClient.get<{ items: Workspace[]; pagination: any }>('/workspaces', params),
  getWorkspaceById: (id: string) => apiClient.get<Workspace>(`/workspaces/${id}`),
  createWorkspace: (data: any) => apiClient.post<Workspace>('/workspaces', data),
  updateWorkspace: (id: string, data: any) => apiClient.put<Workspace>(`/workspaces/${id}`, data),
  updateStatus: (id: string, status: string) => apiClient.patch<Workspace>(`/workspaces/${id}/status`, { status }),
  getMetadata: () => apiClient.get<{ types: any[]; amenities: any[] }>('/workspaces/meta/types-and-amenities'),
};
