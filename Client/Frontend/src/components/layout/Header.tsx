import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../stores/AuthContext';
import { Button } from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/Dropdown';
import { Sparkles, Calendar, Bell, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const { client, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-3.5 py-2 rounded-lg text-sm font-medium transition-colors select-none',
      isActive
        ? 'text-primary font-semibold bg-primary/10'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
    );

  return (
    <header className="h-16 border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl h-full mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 select-none">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-black text-foreground tracking-tight">CoSpace</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          <NavLink to="/" end className={navLinkClasses}>
            Home
          </NavLink>
          <NavLink to="/workspaces" className={navLinkClasses}>
            Workspaces
          </NavLink>
          {client && (
            <>
              <NavLink to="/bookings" className={navLinkClasses}>
                My Bookings
              </NavLink>
              <NavLink to="/notifications" className={navLinkClasses}>
                Notifications
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Auth / Profile Controls */}
        <div className="flex items-center gap-3">
          {client ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-full border border-border/80 bg-card/60 px-3.5 py-1.5 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {client.first_name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-semibold">{client.first_name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Profile & Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/bookings')}>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>My Bookings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/notifications')}>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} isDanger>
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" className="shadow-md shadow-primary/20">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
