import { apiClient } from './apiClient';

export const profileApi = {
  getProfile: () => apiClient.get<any>('/profile'),
  updateProfile: (data: any) => apiClient.put<any>('/profile', data),
  updatePreferences: (preferences: any) => apiClient.put<any>('/profile/preferences', preferences),
};
