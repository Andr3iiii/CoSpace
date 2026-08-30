import React from 'react';
import { styles } from '../../theme/styles';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isGlass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, isGlass = false, style, ...props }) => {
  const baseStyle = isGlass ? styles.glassCard : styles.card;
  return (
    <div style={{ ...baseStyle, ...style }} {...props}>
      {children}
    </div>
  );
};
