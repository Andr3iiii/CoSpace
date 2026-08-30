import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { theme } from '../../theme/theme';
import { useAuth } from '../../stores/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Building2,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <NavLink
      to={to}
      end={to === '/admin'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 14px',
        borderRadius: theme.radius.md,
        color: isActive ? '#FFFFFF' : isHovered ? theme.colors.text : theme.colors.textMuted,
        backgroundColor: isActive
          ? theme.colors.primary
          : isHovered
          ? theme.colors.surfaceHover
          : 'transparent',
        textDecoration: 'none',
        fontSize: theme.typography.fontSize.sm,
        fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium,
        transition: 'all 0.15s ease',
        marginBottom: '4px',
      })}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: theme.colors.sidebar,
        borderRight: `1px solid ${theme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: theme.shadows.glow,
          }}
        >
          <Sparkles size={20} />
        </div>
        <div>
          <h1
            style={{
              fontSize: theme.typography.fontSize.md,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text,
              letterSpacing: '-0.02em',
            }}
          >
            CoSpace
          </h1>
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: theme.colors.primary,
              fontWeight: theme.typography.fontWeight.bold,
            }}
          >
            Admin Portal
          </span>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: theme.colors.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 8px 8px' }}>
          Management
        </div>
        <SidebarItem to="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <SidebarItem to="/admin/bookings" icon={<CalendarCheck size={18} />} label="Bookings" />
        <SidebarItem to="/admin/clients" icon={<Users size={18} />} label="Clients" />
        <SidebarItem to="/admin/workspaces" icon={<Building2 size={18} />} label="Workspaces" />
        <SidebarItem to="/admin/payments" icon={<CreditCard size={18} />} label="Payments" />

        <div style={{ fontSize: '11px', fontWeight: 600, color: theme.colors.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px 8px 8px 8px' }}>
          Operations
        </div>
        <SidebarItem to="/admin/reports" icon={<BarChart3 size={18} />} label="Reports" />
        <SidebarItem to="/admin/settings" icon={<Settings size={18} />} label="Settings" />
      </div>

      {/* User profile footer */}
      <div
        style={{
          padding: '16px',
          borderTop: `1px solid ${theme.colors.border}`,
          backgroundColor: 'rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: theme.colors.surfaceHover,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.text,
              fontWeight: 600,
              fontSize: '13px',
              flexShrink: 0,
            }}
          >
            {admin?.first_name?.charAt(0) || 'A'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.text, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {admin ? `${admin.first_name} ${admin.last_name}` : 'Admin'}
            </p>
            <p style={{ fontSize: '11px', color: theme.colors.textDim, textTransform: 'capitalize' }}>
              {admin?.role || 'Staff'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          style={{
            background: 'transparent',
            border: 'none',
            color: theme.colors.textDim,
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
