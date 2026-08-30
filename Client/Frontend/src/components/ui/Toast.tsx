import React from 'react';
import { theme } from '../../theme/theme';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  type?: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type = 'info', message, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color={theme.colors.success} />;
      case 'error':
        return <AlertCircle size={18} color={theme.colors.danger} />;
      case 'info':
      default:
        return <Info size={18} color={theme.colors.info} />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        backgroundColor: theme.colors.surfaceCard,
        border: `1px solid ${theme.colors.borderLight}`,
        borderRadius: theme.radius.md,
        boxShadow: theme.shadows.lg,
        color: theme.colors.text,
        fontSize: theme.typography.fontSize.sm,
      }}
    >
      {getIcon()}
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: theme.colors.textDim, cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
