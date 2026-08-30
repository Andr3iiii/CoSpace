import React, { SelectHTMLAttributes, forwardRef, useState } from 'react';
import { theme } from '../../theme/theme';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: Array<{ value: string | number; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, style, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '12px' }}>
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
        <select
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            padding: '10px 14px',
            backgroundColor: theme.colors.surface,
            border: `1px solid ${error ? theme.colors.danger : isFocused ? theme.colors.primary : theme.colors.border}`,
            borderRadius: theme.radius.md,
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.base,
            outline: 'none',
            cursor: 'pointer',
            ...style,
          }}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ backgroundColor: theme.colors.surface }}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && (
          <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.danger, marginTop: '4px' }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
