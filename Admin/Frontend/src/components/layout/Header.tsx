import React from 'react';
import { theme } from '../../theme/theme';
import { Bell, Search, Menu } from 'lucide-react';

export interface HeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuToggle }) => {
  return (
    <header
      style={{
        height: '64px',
        backgroundColor: theme.colors.header,
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.text,
              cursor: 'pointer',
              display: 'flex',
              padding: '6px',
            }}
          >
            <Menu size={20} />
          </button>
        )}
        <h2 style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text }}>
          {title}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Quick Search */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '10px',
              color: theme.colors.textDim,
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search dashboard..."
            style={{
              padding: '6px 12px 6px 32px',
              fontSize: theme.typography.fontSize.xs,
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.md,
              color: theme.colors.text,
              width: '200px',
              outline: 'none',
            }}
          />
        </div>

        {/* Notifications Icon */}
        <button
          style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.md,
            color: theme.colors.textMuted,
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: theme.colors.primary,
            }}
          />
        </button>
      </div>
    </header>
  );
};
