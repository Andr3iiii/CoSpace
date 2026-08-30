import React, { useState, ButtonHTMLAttributes } from 'react';
import { theme } from '../../theme/theme';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: isHovered ? theme.colors.surfaceHover : theme.colors.surface,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.borderLight}`,
        };
      case 'outline':
        return {
          backgroundColor: isHovered ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
          color: theme.colors.text,
          border: `1px solid ${isHovered ? theme.colors.primary : theme.colors.border}`,
        };
      case 'accent':
        return {
          backgroundColor: isHovered ? '#D97706' : theme.colors.accent,
          color: '#FFFFFF',
          border: '1px solid transparent',
        };
      case 'danger':
        return {
          backgroundColor: isHovered ? theme.colors.dangerHover : theme.colors.danger,
          color: '#FFFFFF',
          border: '1px solid transparent',
        };
      case 'ghost':
        return {
          backgroundColor: isHovered ? theme.colors.surfaceHover : 'transparent',
          color: theme.colors.textMuted,
          border: '1px solid transparent',
        };
      case 'primary':
      default:
        return {
          backgroundColor: isHovered ? theme.colors.primaryHover : theme.colors.primary,
          color: '#FFFFFF',
          border: '1px solid transparent',
          boxShadow: isHovered ? theme.shadows.glow : 'none',
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '7px 14px',
          fontSize: theme.typography.fontSize.xs,
          gap: '6px',
        };
      case 'lg':
        return {
          padding: '14px 28px',
          fontSize: theme.typography.fontSize.md,
          gap: '10px',
        };
      case 'md':
      default:
        return {
          padding: '10px 20px',
          fontSize: theme.typography.fontSize.base,
          gap: '8px',
        };
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: theme.typography.fontWeight.semibold,
    borderRadius: theme.radius.md,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    transform: isPressed && !disabled ? 'scale(0.98)' : 'scale(1)',
    transition: 'all 0.15s ease-in-out',
    outline: 'none',
    userSelect: 'none',
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={baseStyle}
    >
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '50%',
            borderTopColor: '#fff',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
