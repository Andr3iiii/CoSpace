import { apiClient } from './apiClient';
import { ClientUser } from '../types';

export const authApi = {
  sendOtp: (email: string) =>
    apiClient.post<{ success: boolean; message: string }>('/auth/send-otp', { email }),
  verifyOtp: (email: string, otp: string) =>
    apiClient.post<{ success: boolean; verified: boolean; verificationToken?: string; message?: string }>('/auth/verify-otp', { email, otp }),
  register: (data: {
    email: string;
    password: string;
    confirmPassword?: string;
    firstName: string;
    lastName: string;
    countryCode?: string;
    phone?: string;
    companyName?: string;
    verificationToken?: string;
  }) =>
    apiClient.post<{ token: string; client: ClientUser }>('/auth/register', data),
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<{ token: string; client: ClientUser }>('/auth/login', credentials),
  me: () => apiClient.get<ClientUser>('/auth/me'),
  logout: () => apiClient.post<void>('/auth/logout'),
};
