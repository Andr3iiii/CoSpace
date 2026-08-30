import React from 'react';
import { theme } from './theme';

export const styles = {
  card: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.colors.border}`,
    padding: theme.spacing.lg,
    boxShadow: theme.shadows.md,
  } as React.CSSProperties,

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  } as React.CSSProperties,

  flexRow: {
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,

  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,

  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  input: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.radius.md,
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.base,
    outline: 'none',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  label: {
    display: 'block',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  } as React.CSSProperties,

  badge: (type: 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral'): React.CSSProperties => {
    switch (type) {
      case 'success':
        return {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.semibold,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.successBg,
          color: theme.colors.success,
          border: `1px solid ${theme.colors.successBorder}`,
        };
      case 'warning':
        return {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.semibold,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.warningBg,
          color: theme.colors.warning,
          border: `1px solid ${theme.colors.warningBorder}`,
        };
      case 'danger':
        return {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.semibold,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.dangerBg,
          color: theme.colors.danger,
          border: `1px solid ${theme.colors.dangerBorder}`,
        };
      case 'info':
        return {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.semibold,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.infoBg,
          color: theme.colors.info,
          border: `1px solid rgba(59, 130, 246, 0.3)`,
        };
      default:
        return {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.semibold,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.surfaceHover,
          color: theme.colors.textMuted,
          border: `1px solid ${theme.colors.border}`,
        };
    }
  },
};
