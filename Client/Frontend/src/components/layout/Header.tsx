import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../stores/AuthContext';
import { Button } from '../ui/Button';
import { theme } from '../../theme/theme';
import { Sparkles, Calendar, Heart, Bell, User, LogOut, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { client, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    color: isActive ? theme.colors.primary : theme.colors.textMuted,
    textDecoration: 'none',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium,
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    transition: 'color 0.15s ease',
  });

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: theme.colors.header,
        borderBottom: `1px solid ${theme.colors.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          height: '100%',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
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
            <span
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
              }}
            >
              CoSpace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <NavLink to="/" end style={navLinkStyle}>Home</NavLink>
          <NavLink to="/workspaces" style={navLinkStyle}>Workspaces</NavLink>
          {client && (
            <>
              <NavLink to="/bookings" style={navLinkStyle}>My Bookings</NavLink>
              <NavLink to="/notifications" style={navLinkStyle}>Notifications</NavLink>
            </>
          )}
        </nav>

        {/* Right Auth / Profile Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {client ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.borderLight}`,
                  borderRadius: theme.radius.full,
                  padding: '6px 14px',
                  color: theme.colors.text,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: theme.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                >
                  {client.first_name.charAt(0)}
                </div>
                <span>{client.first_name}</span>
              </button>

              {profileDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '8px',
                    width: '180px',
                    backgroundColor: theme.colors.surfaceCard,
                    border: `1px solid ${theme.colors.borderLight}`,
                    borderRadius: theme.radius.md,
                    boxShadow: theme.shadows.lg,
                    padding: '6px 0',
                    zIndex: 200,
                  }}
                >
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      color: theme.colors.text,
                      textDecoration: 'none',
                      fontSize: '13px',
                    }}
                  >
                    <User size={15} /> Profile & Settings
                  </Link>
                  <Link
                    to="/bookings"
                    onClick={() => setProfileDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      color: theme.colors.text,
                      textDecoration: 'none',
                      fontSize: '13px',
                    }}
                  >
                    <Calendar size={15} /> My Bookings
                  </Link>
                  <div style={{ height: '1px', backgroundColor: theme.colors.border, margin: '6px 0' }} />
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      color: theme.colors.danger,
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
