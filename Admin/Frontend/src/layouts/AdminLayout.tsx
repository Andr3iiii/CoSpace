import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useAuth } from '../stores/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import { theme } from '../theme/theme';

export const AdminLayout: React.FC = () => {
  const { token, isLoading } = useAuth();
  const { isMobile } = useResponsive();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
          color: theme.colors.textMuted,
        }}
      >
        Loading administration portal...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const getPageTitle = (): string => {
    const path = location.pathname;
    if (path === '/admin') return 'Executive Dashboard';
    if (path.startsWith('/admin/bookings')) return 'Booking Management';
    if (path.startsWith('/admin/clients')) return 'Client Directory';
    if (path.startsWith('/admin/workspaces')) return 'Workspace Inventory';
    if (path.startsWith('/admin/payments')) return 'Financial Transactions';
    if (path.startsWith('/admin/reports')) return 'Performance Reports';
    if (path.startsWith('/admin/settings')) return 'Platform Settings';
    return 'Admin';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.colors.background }}>
      {/* Desktop Sidebar / Mobile Overlay Sidebar */}
      {(!isMobile || mobileSidebarOpen) && (
        <Sidebar onClose={() => setMobileSidebarOpen(false)} />
      )}

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          title={getPageTitle()}
          onMenuToggle={isMobile ? () => setMobileSidebarOpen(!mobileSidebarOpen) : undefined}
        />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
