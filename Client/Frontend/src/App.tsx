import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './stores/AuthContext';
import { ThemeProvider } from './stores/ThemeContext';
import { ClientLayout } from './layouts/ClientLayout';
import { HomePage } from './pages/home/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { WorkspacesPage } from './pages/workspaces/WorkspacesPage';
import { WorkspaceDetailPage } from './pages/workspaces/WorkspaceDetailPage';
import { BookingPage } from './pages/booking/BookingPage';
import { PaymentPage } from './pages/payment/PaymentPage';
import { PaymentSuccessPage } from './pages/payment/PaymentSuccessPage';
import { MyBookingsPage } from './pages/bookings/MyBookingsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route element={<ClientLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/workspaces" element={<WorkspacesPage />} />
              <Route path="/workspaces/:id" element={<WorkspaceDetailPage />} />
              <Route path="/book/:workspaceId" element={<BookingPage />} />
              <Route path="/payment/:bookingId" element={<PaymentPage />} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/bookings" element={<MyBookingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
