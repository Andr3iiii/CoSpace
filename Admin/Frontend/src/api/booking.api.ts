import { apiClient } from './apiClient';
import { Booking } from '../types';

export const bookingApi = {
  getBookings: (params?: Record<string, any>) =>
    apiClient.get<{ items: Booking[]; pagination: any }>('/bookings', params),
  getBookingById: (id: string) => apiClient.get<Booking>(`/bookings/${id}`),
  updateStatus: (id: string, status: string, reason?: string) =>
    apiClient.patch<Booking>(`/bookings/${id}/status`, { status, reason }),
  reschedule: (id: string, startTime: string, endTime: string) =>
    apiClient.post<Booking>(`/bookings/${id}/reschedule`, { startTime, endTime }),
};
