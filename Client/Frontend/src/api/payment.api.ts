import { apiClient } from './apiClient';

export const paymentApi = {
  createIntent: (bookingId: string, paymentMethodType = 'card') =>
    apiClient.post<{ payment: any; clientKey: string }>('/payments/create-intent', { bookingId, paymentMethodType }),
  confirmPayment: (paymentId: string) =>
    apiClient.post<{ success: boolean; bookingId: string }>('/payments/confirm', { paymentId }),
};
