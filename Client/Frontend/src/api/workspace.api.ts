import { apiClient } from './apiClient';
import { Workspace } from '../types';

export const workspaceApi = {
  getWorkspaces: (params?: Record<string, any>) =>
    apiClient.get<Workspace[]>('/workspaces', params),
  getWorkspaceDetails: (idOrSlug: string) =>
    apiClient.get<Workspace>(`/workspaces/${idOrSlug}`),
  checkAvailability: (id: string, startTime: string, endTime: string) =>
    apiClient.post<{ workspaceId: string; isAvailable: boolean }>(`/workspaces/${id}/availability`, { startTime, endTime }),
  getBookedSlots: (id: string, date: string) =>
    apiClient.get<Array<{ startTime: string; endTime: string; status: string }>>(`/workspaces/${id}/booked-slots`, { date }),
};
