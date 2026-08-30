import React, { useState, InputHTMLAttributes, forwardRef } from 'react';
import { theme } from '../../theme/theme';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, style, disabled, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '14px' }}>
        {label && (
          <label
            style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: error ? theme.colors.danger : theme.colors.textMuted,
              marginBottom: theme.spacing.xs,
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
          {leftIcon && (
            <span
              style={{
                position: 'absolute',
                left: '14px',
                display: 'flex',
                alignItems: 'center',
                color: isFocused ? theme.colors.primary : theme.colors.textDim,
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              width: '100%',
              padding: leftIcon ? '12px 16px 12px 42px' : rightIcon ? '12px 42px 12px 16px' : '12px 16px',
              backgroundColor: theme.colors.surface,
              border: `1px solid ${
                error
                  ? theme.colors.danger
                  : isFocused
                  ? theme.colors.primary
                  : isHovered
                  ? theme.colors.borderLight
                  : theme.colors.border
              }`,
              borderRadius: theme.radius.md,
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.base,
              outline: 'none',
              transition: 'all 0.15s ease',
              boxShadow: isFocused ? `0 0 0 3px ${error ? theme.colors.dangerBg : theme.colors.primaryLight}` : 'none',
              opacity: disabled ? 0.6 : 1,
              cursor: disabled ? 'not-allowed' : 'text',
              ...style,
            }}
            {...props}
          />
          {rightIcon && (
            <span
              style={{
                position: 'absolute',
                right: '14px',
                display: 'flex',
                alignItems: 'center',
                color: theme.colors.textDim,
              }}
            >
              {rightIcon}
            </span>
          )}
        </div>
        {error ? (
          <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.danger, marginTop: '4px' }}>
            {error}
          </span>
        ) : helperText ? (
          <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textDim, marginTop: '4px' }}>
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
