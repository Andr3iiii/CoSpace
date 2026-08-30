import { apiClient } from './apiClient';
import { Payment } from '../types';

export const paymentApi = {
  getPayments: (params?: Record<string, any>) =>
    apiClient.get<{ items: Payment[]; pagination: any }>('/payments', params),
  getPaymentById: (id: string) => apiClient.get<Payment>(`/payments/${id}`),
  refund: (id: string, amount: number, reason: string) =>
    apiClient.post<any>(`/payments/${id}/refund`, { amount, reason }),
};
