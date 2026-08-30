import React, { useState } from 'react';
import { theme } from '../../theme/theme';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      style={{ position: 'relative', display: 'inline-flex' }}
    >
      {children}
      {isVisible && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '6px',
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.borderLight}`,
            color: theme.colors.text,
            padding: '4px 8px',
            borderRadius: theme.radius.xs,
            fontSize: theme.typography.fontSize.xs,
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: 'none',
            boxShadow: theme.shadows.md,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
