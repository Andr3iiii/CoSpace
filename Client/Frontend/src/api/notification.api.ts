import { apiClient } from './apiClient';
import { NotificationItem } from '../types';

export const notificationApi = {
  getNotifications: () => apiClient.get<NotificationItem[]>('/notifications'),
  markAsRead: (id: string) => apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`),
};
