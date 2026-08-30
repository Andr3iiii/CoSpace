import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      end={to === '/admin'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 select-none mb-1',
          isActive
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold'
            : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
        )
      }
    >
      <span className="h-4 w-4 shrink-0">{icon}</span>
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
    <aside className="w-64 bg-card border-r border-border/80 flex flex-col h-screen sticky top-0 shrink-0 z-50 shadow-sm">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-border/80">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground tracking-tight">CoSpace</h1>
          <span className="text-[11px] uppercase tracking-wider text-primary font-bold">
            Admin Portal
          </span>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 p-3 overflow-y-auto space-y-4">
        <div>
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pb-2">
            Management
          </div>
          <SidebarItem to="/admin" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
          <SidebarItem to="/admin/bookings" icon={<CalendarCheck className="h-4 w-4" />} label="Bookings" />
          <SidebarItem to="/admin/clients" icon={<Users className="h-4 w-4" />} label="Clients" />
          <SidebarItem to="/admin/workspaces" icon={<Building2 className="h-4 w-4" />} label="Workspaces" />
          <SidebarItem to="/admin/payments" icon={<CreditCard className="h-4 w-4" />} label="Payments" />
        </div>

        <div>
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pb-2">
            Operations
          </div>
          <SidebarItem to="/admin/reports" icon={<BarChart3 className="h-4 w-4" />} label="Reports" />
          <SidebarItem to="/admin/settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
        </div>
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-border/80 bg-background/50 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-8 w-8 rounded-full bg-secondary border border-border/80 flex items-center justify-center text-foreground font-semibold text-xs shrink-0">
            {admin?.first_name?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-foreground truncate">
              {admin ? `${admin.first_name} ${admin.last_name}` : 'Admin'}
            </p>
            <p className="text-[10px] text-muted-foreground capitalize truncate">
              {admin?.role || 'Staff'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
