import React, { useState } from 'react';
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
import { Sparkles, Calendar, Bell, User, LogOut, Menu, X, Home, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const { client, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-3.5 py-2 rounded-lg text-sm font-medium transition-colors select-none',
      isActive
        ? 'text-primary font-semibold bg-primary/10'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
    );

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors',
      isActive
        ? 'text-primary font-bold bg-primary/10'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    );

  return (
    <header className="h-16 border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl h-full mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 select-none" onClick={() => setMobileMenuOpen(false)}>
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

        {/* Right Auth / Profile Controls & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
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
            <div className="hidden sm:flex items-center gap-2">
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

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/80 bg-background/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            <NavLink to="/" end className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>
              <Home className="h-5 w-5 text-primary" />
              <span>Home</span>
            </NavLink>
            <NavLink to="/workspaces" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>
              <Building2 className="h-5 w-5 text-primary" />
              <span>Workspaces</span>
            </NavLink>
            {client ? (
              <>
                <NavLink to="/bookings" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>My Bookings</span>
                </NavLink>
                <NavLink to="/notifications" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>
                  <Bell className="h-5 w-5 text-primary" />
                  <span>Notifications</span>
                </NavLink>
                <NavLink to="/profile" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>
                  <User className="h-5 w-5 text-primary" />
                  <span>Profile & Settings</span>
                </NavLink>
                <div className="pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 flex flex-col gap-2.5 border-t border-border/60">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full shadow-md shadow-primary/20">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
