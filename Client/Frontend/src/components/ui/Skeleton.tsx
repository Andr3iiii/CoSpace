import React from 'react';
import { theme } from '../../theme/theme';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = theme.radius.sm,
  style,
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: theme.colors.surfaceHover,
        opacity: 0.6,
        animation: 'pulse 1.5s infinite ease-in-out',
        ...style,
      }}
    />
  );
};
