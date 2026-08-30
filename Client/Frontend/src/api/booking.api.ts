import { apiClient } from './apiClient';
import { Booking } from '../types';

export const bookingApi = {
  getMyBookings: () => apiClient.get<Booking[]>('/bookings'),
  getBookingDetail: (id: string) => apiClient.get<Booking>(`/bookings/${id}`),
  createBooking: (data: {
    workspaceId: string;
    startTime: string;
    endTime: string;
    addOns?: Array<{ addOnId: string; quantity: number }>;
    specialRequests?: string;
  }) => apiClient.post<Booking>('/bookings', data),
  cancelBooking: (id: string, reason?: string) =>
    apiClient.post<Booking>(`/bookings/${id}/cancel`, { reason }),
};
