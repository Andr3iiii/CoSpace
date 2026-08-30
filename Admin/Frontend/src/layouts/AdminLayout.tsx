import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useAuth } from '../stores/AuthContext';
import { useResponsive } from '../hooks/useResponsive';

export const AdminLayout: React.FC = () => {
  const { token, isLoading } = useAuth();
  const { isMobile } = useResponsive();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-muted-foreground text-sm">
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
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar / Mobile Overlay Sidebar */}
      {(!isMobile || mobileSidebarOpen) && (
        <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={getPageTitle()}
          onMenuToggle={isMobile ? () => setMobileSidebarOpen(!mobileSidebarOpen) : undefined}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
