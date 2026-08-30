import React from 'react';
import { styles } from '../../theme/styles';

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, style }) => {
  return <span style={{ ...styles.badge(variant), ...style }}>{children}</span>;
};
